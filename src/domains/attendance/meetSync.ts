import { google, type meet_v2 } from "googleapis";
import { and, eq, gte, isNull, lt, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { attendance } from "@/db/schema/academic/attendance";
import { classSessions } from "@/db/schema/academic/classSessions";
import { meetPresence } from "@/db/schema/academic/meetPresence";
import { enrollments } from "@/db/schema/core/enrollments";
import { profiles } from "@/db/schema/core/profiles";
import { getConnectedClient, hasMeetScope } from "@/server/integrations/google";
import { judge, AWAY_LIMIT_MINUTES, type Stretch } from "./rule";

const MIN = 60_000;

export type SyncResult = { ok: true; matched: number; unmatched: number } | { ok: false; message: string };

/** The "abc-defg-hij" part of a Meet link, or null for links that aren't Google Meet. */
export function meetingCode(url: string) {
  return /meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/i.exec(url)?.[1]?.toLowerCase() ?? null;
}

const normalName = (n: string | null | undefined) => (n ?? "").toLowerCase().replace(/[^a-zऀ-ॿ]+/g, " ").trim();

async function all<T>(fetchPage: (pageToken?: string) => Promise<{ items?: T[]; next?: string | null }>) {
  const out: T[] = [];
  let token: string | undefined;
  do {
    const { items, next } = await fetchPage(token);
    out.push(...(items ?? []));
    token = next ?? undefined;
  } while (token);
  return out;
}

type Seen = {
  participant: string;
  displayName: string | null;
  kind: "signed_in" | "anonymous" | "phone";
  googleUserId: string | null;
  stretches: Stretch[];
};

/** Everyone who was in the class's Meet calls, with each stretch they spent there. */
async function readMeet(meet: meet_v2.Meet, code: string, from: Date, until: Date) {
  const records = (
    await all<meet_v2.Schema$ConferenceRecord>(async (pageToken) => {
      const r = await meet.conferenceRecords.list({
        filter: `space.meeting_code = "${code}" AND start_time >= "${from.toISOString()}"`,
        pageSize: 25,
        pageToken,
      });
      return { items: r.data.conferenceRecords, next: r.data.nextPageToken };
    })
  ).filter((c) => c.startTime && new Date(c.startTime) <= until);

  const people: Seen[] = [];
  for (const rec of records) {
    const participants = await all<meet_v2.Schema$Participant>(async (pageToken) => {
      const r = await meet.conferenceRecords.participants.list({ parent: rec.name!, pageSize: 250, pageToken });
      return { items: r.data.participants, next: r.data.nextPageToken };
    });
    // A few at a time, to stay well inside Google's request limits.
    for (let i = 0; i < participants.length; i += 8) {
      await Promise.all(
        participants.slice(i, i + 8).map(async (p) => {
          const sessions = await all<meet_v2.Schema$ParticipantSession>(async (pageToken) => {
            const r = await meet.conferenceRecords.participants.participantSessions.list({ parent: p.name!, pageSize: 250, pageToken });
            return { items: r.data.participantSessions, next: r.data.nextPageToken };
          });
          people.push({
            participant: p.name!,
            displayName: p.signedinUser?.displayName ?? p.anonymousUser?.displayName ?? p.phoneUser?.displayName ?? null,
            kind: p.signedinUser ? "signed_in" : p.phoneUser ? "phone" : "anonymous",
            googleUserId: p.signedinUser?.user?.replace(/^users\//, "") ?? null,
            stretches: sessions
              .filter((s) => s.startTime)
              .map((s) => ({ start: new Date(s.startTime!), end: s.endTime ? new Date(s.endTime) : null })),
          });
        })
      );
    }
  }
  return { records, people };
}

/**
 * Reads who joined a class on Google Meet and when, then marks each student present or absent
 * (absent after AWAY_LIMIT_MINUTES away in one go). Marks a teacher has set by hand are never changed.
 */
export async function syncMeetAttendance(sessionId: string): Promise<SyncResult> {
  const [session] = await db.select().from(classSessions).where(eq(classSessions.id, sessionId));
  if (!session) return { ok: false, message: "Class not found." };
  const fail = async (message: string): Promise<SyncResult> => {
    await db.update(classSessions).set({ meetSyncedAt: new Date(), meetSyncError: message }).where(eq(classSessions.id, sessionId));
    return { ok: false, message };
  };

  const now = new Date();
  if (session.status === "cancelled") return { ok: false, message: "This class was cancelled." };
  if (now < session.startsAt) return { ok: false, message: "The class hasn't started yet." };
  const code = meetingCode(session.meetingUrl);
  if (!code) return fail("This class's link isn't a Google Meet link, so attendance has to be marked by hand.");

  const conn = await getConnectedClient().catch(() => null);
  if (!conn) return fail("Google isn't connected. An admin can connect it in Settings.");
  if (!hasMeetScope(conn.scopes)) return fail("Google needs reconnecting once to allow attendance. An admin can do it in Settings.");

  let records: meet_v2.Schema$ConferenceRecord[];
  let people: Seen[];
  try {
    ({ records, people } = await readMeet(
      google.meet({ version: "v2", auth: conn.client }),
      code,
      new Date(session.startsAt.getTime() - 120 * MIN),
      session.endsAt
    ));
  } catch (err) {
    console.error(`[meet attendance] ${sessionId}`, err);
    const status = (err as { code?: number }).code;
    return fail(
      status === 401 || status === 403
        ? "Google refused access to this class's Meet call. An admin can reconnect Google in Settings."
        : "We couldn't read Google Meet just now. Try Refresh in a minute."
    );
  }
  if (records.length === 0) return fail("Nobody has joined this class's Google Meet yet.");

  // The window runs from the scheduled start (or when the call actually began, if later)
  // to the scheduled end (or when the call ended, or now while it's still on).
  const callStart = Math.min(...records.map((r) => new Date(r.startTime!).getTime()));
  const callOver = records.every((r) => r.endTime);
  const callEnd = callOver ? Math.max(...records.map((r) => new Date(r.endTime!).getTime())) : now.getTime();
  const from = new Date(Math.max(session.startsAt.getTime(), callStart));
  const to = new Date(Math.min(session.endsAt.getTime(), callEnd, now.getTime()));
  const classOver = now >= session.endsAt || callOver;

  const roster = await db
    .select({ id: profiles.id, name: profiles.fullName, googleUserId: profiles.googleUserId })
    .from(enrollments)
    .innerJoin(profiles, eq(profiles.id, enrollments.studentProfileId))
    .where(and(eq(enrollments.batchId, session.batchId), eq(enrollments.status, "active")));

  // Match by linked Google account first; otherwise by name, but only when exactly one student has that name.
  const byGoogle = new Map(roster.filter((r) => r.googleUserId).map((r) => [r.googleUserId!, r.id]));
  const nameCounts = new Map<string, number>();
  for (const r of roster) nameCounts.set(normalName(r.name), (nameCounts.get(normalName(r.name)) ?? 0) + 1);
  const byName = new Map(roster.filter((r) => nameCounts.get(normalName(r.name)) === 1).map((r) => [normalName(r.name), r.id]));
  const whoIs = (p: Seen) => (p.googleUserId && byGoogle.get(p.googleUserId)) || byName.get(normalName(p.displayName)) || null;

  const stretchesFor = new Map<string, Stretch[]>();
  const presenceRows = people.flatMap((p) => {
    const studentId = whoIs(p);
    if (studentId) stretchesFor.set(studentId, [...(stretchesFor.get(studentId) ?? []), ...p.stretches]);
    return p.stretches.map((s) => ({
      sessionId,
      studentProfileId: studentId,
      participant: p.participant,
      displayName: p.displayName,
      kind: p.kind,
      googleUserId: p.googleUserId,
      joinedAt: s.start,
      leftAt: s.end,
    }));
  });

  const marks = roster
    .map((r) => ({ studentId: r.id, ...judge(stretchesFor.get(r.id) ?? [], from, to) }))
    .filter((m) => m.status !== null);

  await db.transaction(async (tx) => {
    // Two people opening the page at once shouldn't write the log twice.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${sessionId}))`);
    await tx.delete(meetPresence).where(eq(meetPresence.sessionId, sessionId));
    if (presenceRows.length) await tx.insert(meetPresence).values(presenceRows);
    for (const m of marks) {
      const manual = sql`${attendance.source} = 'manual'`;
      await tx
        .insert(attendance)
        .values({
          sessionId,
          studentProfileId: m.studentId,
          status: m.status!,
          source: "meet",
          markedBy: null,
          markedAt: now,
          minutesPresent: m.minutesPresent,
          longestGapMinutes: m.longestGapMinutes,
        })
        .onConflictDoUpdate({
          target: [attendance.sessionId, attendance.studentProfileId],
          // Always refresh the Meet numbers; only change the mark itself if a teacher hasn't set it.
          set: {
            minutesPresent: m.minutesPresent,
            longestGapMinutes: m.longestGapMinutes,
            status: sql`case when ${manual} then ${attendance.status} else ${m.status!}::attendance_status end`,
            markedAt: sql`case when ${manual} then ${attendance.markedAt} else ${now.toISOString()}::timestamptz end`,
            updatedAt: now,
          },
        });
    }
    await tx
      .update(classSessions)
      .set({
        meetSyncedAt: now,
        meetSyncError: null,
        ...(classOver && session.status === "scheduled" ? { status: "completed" as const } : {}),
      })
      .where(eq(classSessions.id, sessionId));
  });

  return { ok: true, matched: stretchesFor.size, unmatched: people.filter((p) => !whoIs(p)).length };
}

/** True when a page view should read Meet again: the class is on (and the last read is a minute old), or it ended after the last read. */
export function needsSync(s: { startsAt: Date; endsAt: Date; status: string; meetSyncedAt: Date | null }, now = new Date()) {
  if (s.status === "cancelled" || now < s.startsAt) return false;
  if (!s.meetSyncedAt) return true;
  const live = now < new Date(s.endsAt.getTime() + 5 * MIN);
  if (live) return now.getTime() - s.meetSyncedAt.getTime() > MIN;
  // After class: one last read once the call has had time to wrap up, then leave it be.
  return s.meetSyncedAt.getTime() < s.endsAt.getTime() + 5 * MIN;
}

/** For the nightly cron: classes from the last two days that ended without a final Meet read. */
export async function syncRecentClasses() {
  const now = new Date();
  const due = await db
    .select({ id: classSessions.id, startsAt: classSessions.startsAt, endsAt: classSessions.endsAt, status: classSessions.status, meetSyncedAt: classSessions.meetSyncedAt })
    .from(classSessions)
    .where(
      and(
        gte(classSessions.startsAt, new Date(now.getTime() - 48 * 60 * MIN)),
        lte(classSessions.endsAt, new Date(now.getTime() - 5 * MIN)),
        or(isNull(classSessions.meetSyncedAt), lt(classSessions.meetSyncedAt, sql`${classSessions.endsAt} + interval '5 minutes'`))
      )
    );
  const results: Record<string, string> = {};
  for (const s of due.filter((d) => needsSync(d, now))) {
    const r = await syncMeetAttendance(s.id);
    results[s.id] = r.ok ? `ok (${r.matched} matched, ${r.unmatched} unknown)` : r.message;
  }
  return { checked: due.length, results, awayLimitMinutes: AWAY_LIMIT_MINUTES };
}
