import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, RefreshCw, Video, AlertTriangle } from "lucide-react";
import { db } from "@/db";
import { classSessions } from "@/db/schema/academic/classSessions";
import { attendance } from "@/db/schema/academic/attendance";
import { meetPresence } from "@/db/schema/academic/meetPresence";
import { batches } from "@/db/schema/core/batches";
import { enrollments } from "@/db/schema/core/enrollments";
import { profiles } from "@/db/schema/core/profiles";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { AutoRefresh } from "@/features/dashboard/ui/AutoRefresh";
import { Avatar } from "@/features/shared/ui/Avatar";
import { enforcePageRole, requireRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { canManageBatch } from "@/server/authorization/access";
import { isUuid, formatIST } from "@/lib/ids";
import { PendingButton } from "@/features/shared/ui/PendingButton";
import { meetingCode, needsSync, syncMeetAttendance } from "@/src/domains/attendance/meetSync";
import { AWAY_LIMIT_MINUTES } from "@/src/domains/attendance/rule";

export const dynamic = "force-dynamic";

const STATUSES = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
] as const;
type Status = (typeof STATUSES)[number]["value"];

async function managedSession(sessionId: unknown) {
  const me = await requireRole(["admin", "teacher"]);
  if (!isUuid(sessionId)) throw new Error("Invalid class");
  const [session] = await db.select().from(classSessions).where(eq(classSessions.id, sessionId));
  if (!session || !(await canManageBatch(me, session.batchId))) throw new Error("Not allowed");
  return { me, session };
}

/** Saves only the marks the teacher changed; those become "set by teacher" and Meet stops changing them. */
async function saveAttendance(formData: FormData) {
  "use server";
  const { me, session } = await managedSession(formData.get("sessionId"));
  const sessionId = session.id;

  const roster = await db
    .select({ id: enrollments.studentProfileId })
    .from(enrollments)
    .where(and(eq(enrollments.batchId, session.batchId), eq(enrollments.status, "active")));
  const current = new Map((await db.select().from(attendance).where(eq(attendance.sessionId, sessionId))).map((a) => [a.studentProfileId, a]));

  const changed = roster.flatMap((r) => {
    const v = formData.get(`s_${r.id}`);
    if (!STATUSES.some((s) => s.value === v)) return [];
    const status = v as Status;
    return current.get(r.id)?.status === status ? [] : [{ studentProfileId: r.id, status }];
  });

  await db.transaction(async (tx) => {
    for (const row of changed) {
      const now = new Date();
      await tx
        .insert(attendance)
        .values({ sessionId, ...row, source: "manual", markedBy: me.id, markedAt: now })
        .onConflictDoUpdate({
          target: [attendance.sessionId, attendance.studentProfileId],
          set: { status: row.status, source: "manual", markedBy: me.id, markedAt: now, updatedAt: now },
        });
    }
    if (session.status === "scheduled" && session.startsAt < new Date()) {
      await tx.update(classSessions).set({ status: "completed", updatedAt: new Date() }).where(eq(classSessions.id, sessionId));
    }
  });
  revalidatePath("/dashboard/attendance");
  redirect(`/dashboard/attendance/${sessionId}?saved=${changed.length}`);
}

/** Hands one student's mark back to Meet. */
async function handBackToMeet(studentId: string, formData: FormData) {
  "use server";
  const { session } = await managedSession(formData.get("sessionId"));
  if (!isUuid(studentId)) throw new Error("Invalid student");
  await db
    .update(attendance)
    .set({ source: "meet", markedBy: null, updatedAt: new Date() })
    .where(and(eq(attendance.sessionId, session.id), eq(attendance.studentProfileId, studentId)));
  await syncMeetAttendance(session.id);
  redirect(`/dashboard/attendance/${session.id}`);
}

async function refreshFromMeet(formData: FormData) {
  "use server";
  const { session } = await managedSession(formData.get("sessionId"));
  await syncMeetAttendance(session.id);
  redirect(`/dashboard/attendance/${session.id}`);
}

const time = (d: Date | null) => (d ? formatIST(d, { hour: "numeric", minute: "2-digit" }) : "");

/** "Joined 6:02 pm · left 6:20 pm · back 6:24 pm · still in" */
function timeline(stretches: { joinedAt: Date; leftAt: Date | null }[]) {
  const parts: string[] = [];
  stretches.forEach((s, i) => {
    parts.push(`${i === 0 ? "Joined" : "back"} ${time(s.joinedAt)}`);
    parts.push(s.leftAt ? `left ${time(s.leftAt)}` : "still in");
  });
  return parts.join(" · ");
}

export default async function SessionAttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const me = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER]);
  const { sessionId } = await params;
  const { saved } = await searchParams;
  if (!isUuid(sessionId)) notFound();

  let [row] = await db
    .select({ s: classSessions, batchName: batches.name })
    .from(classSessions)
    .innerJoin(batches, eq(batches.id, classSessions.batchId))
    .where(eq(classSessions.id, sessionId));
  if (!row || !(await canManageBatch(me, row.s.batchId))) notFound();

  const isMeet = !!meetingCode(row.s.meetingUrl);
  if (isMeet && needsSync(row.s)) {
    await syncMeetAttendance(sessionId);
    const [s] = await db.select().from(classSessions).where(eq(classSessions.id, sessionId));
    row = { ...row, s };
  }
  const now = new Date();
  const live = now >= row.s.startsAt && now < row.s.endsAt && row.s.status !== "cancelled";

  const [roster, marks, presence] = await Promise.all([
    db
      .select({ id: profiles.id, name: profiles.fullName, photo: profiles.avatarUrl, linked: profiles.googleUserId })
      .from(enrollments)
      .innerJoin(profiles, eq(profiles.id, enrollments.studentProfileId))
      .where(and(eq(enrollments.batchId, row.s.batchId), eq(enrollments.status, "active")))
      .orderBy(profiles.fullName),
    db.select().from(attendance).where(eq(attendance.sessionId, sessionId)),
    db.select().from(meetPresence).where(eq(meetPresence.sessionId, sessionId)).orderBy(asc(meetPresence.joinedAt)),
  ]);
  const markOf = new Map(marks.map((m) => [m.studentProfileId, m]));
  const stretchesOf = new Map<string, typeof presence>();
  const strangers = new Map<string, typeof presence>();
  for (const p of presence) {
    const map = p.studentProfileId ? stretchesOf : strangers;
    const key = p.studentProfileId ?? p.participant;
    map.set(key, [...(map.get(key) ?? []), p]);
  }
  // Without Meet data, keep the old quick default of everyone present.
  const meetWorking = isMeet && !!row.s.meetSyncedAt && !row.s.meetSyncError;

  return (
    <div className="space-y-6">
      {live && isMeet && <AutoRefresh seconds={60} />}
      <Link href="/dashboard/attendance" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All classes
      </Link>
      <div>
        <h1 className="font-serif text-[32px] text-ink-900">{row.s.title}</h1>
        <p className="text-ink-500">{row.batchName} · {formatIST(row.s.startsAt)} – {time(row.s.endsAt)}</p>
      </div>
      {saved !== undefined && (
        <p role="status" className="rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-600">
          {saved === "0" ? "Nothing changed." : `Saved ${saved === "1" ? "1 change" : `${saved} changes`}. Meet won't change these marks now.`}
        </p>
      )}

      {isMeet && (
        <form action={refreshFromMeet} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4">
          <input type="hidden" name="sessionId" value={sessionId} />
          <div className="flex min-w-0 items-start gap-3">
            {row.s.meetSyncError ? (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
            ) : (
              <Video className="mt-0.5 h-5 w-5 shrink-0 text-forest-800" aria-hidden="true" />
            )}
            <div className="text-sm">
              <p className="font-semibold text-ink-900">
                {row.s.meetSyncError
                  ? row.s.meetSyncError
                  : live
                    ? "Live from Google Meet"
                    : row.s.meetSyncedAt
                      ? "Taken from Google Meet"
                      : "Attendance comes from Google Meet once the class starts"}
              </p>
              <p className="text-ink-500">
                {row.s.meetSyncedAt && `Last checked ${time(row.s.meetSyncedAt)}${live ? ", updates every minute" : ""}. `}
                Joining marks a student present; {AWAY_LIMIT_MINUTES}+ minutes away in one go (including joining late or leaving early) marks them absent.
              </p>
            </div>
          </div>
          <PendingButton className="min-h-10 shrink-0 rounded-full border border-line px-4 text-sm font-semibold text-ink-700 hover:bg-paper">
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh
          </PendingButton>
        </form>
      )}

      <DashboardCard title={`Students (${roster.length})`}>
        {roster.length === 0 ? (
          <p className="text-sm text-ink-500">No students are enrolled in this batch yet.</p>
        ) : (
          <form action={saveAttendance} className="space-y-4">
            <input type="hidden" name="sessionId" value={sessionId} />
            <ul className="divide-y divide-line">
              {roster.map((st) => {
                const mark = markOf.get(st.id);
                const current = mark?.status ?? (meetWorking ? undefined : "present");
                const stretches = stretchesOf.get(st.id) ?? [];
                return (
                  <li key={st.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <Avatar id={st.id} photo={st.photo} name={st.name} size={36} />
                      <div className="min-w-0 space-y-0.5">
                        <p className="flex flex-wrap items-center gap-2 font-medium text-ink-900">
                          {st.name}
                          {mark?.source === "manual" ? (
                            <span className="rounded-full bg-paper-deep px-2 py-0.5 text-xs font-semibold text-ink-700">Set by teacher</span>
                          ) : mark ? (
                            <span className="rounded-full bg-forest-50 px-2 py-0.5 text-xs font-semibold text-forest-800">From Meet</span>
                          ) : null}
                          {isMeet && !st.linked && (
                            <span className="rounded-full bg-marigold-100 px-2 py-0.5 text-xs font-semibold text-gold-700" title="Matched by name only. They can link Google on their Profile.">
                              Google not linked
                            </span>
                          )}
                        </p>
                        {stretches.length > 0 ? (
                          <p className="text-[13px] text-ink-500">{timeline(stretches)}</p>
                        ) : isMeet && row.s.meetSyncedAt && !row.s.meetSyncError ? (
                          <p className="text-[13px] text-ink-500">Not seen in the Meet call</p>
                        ) : null}
                        {mark?.minutesPresent != null && (
                          <p className="text-[13px] text-ink-500">
                            {mark.minutesPresent} min in class · longest away {mark.longestGapMinutes} min
                            {mark.source === "manual" && (
                              <>
                                {" · "}
                                <button type="submit" formAction={handBackToMeet.bind(null, st.id)} className="font-semibold text-forest-800 underline underline-offset-2">
                                  Let Meet decide
                                </button>
                              </>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <fieldset className="flex gap-1 rounded-xl bg-paper-deep p-1">
                      <legend className="sr-only">Attendance for {st.name}</legend>
                      {STATUSES.map((o) => (
                        <label key={o.value} className="cursor-pointer">
                          <input type="radio" name={`s_${st.id}`} value={o.value} defaultChecked={current === o.value} className="peer sr-only" />
                          <span className="flex min-h-9 items-center rounded-lg px-3 text-sm font-semibold text-ink-700 peer-checked:bg-forest-800 peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-ink-700/40">
                            {o.label}
                          </span>
                        </label>
                      ))}
                    </fieldset>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <PendingButton className="min-h-11 rounded-full bg-forest-800 px-6 text-sm font-semibold text-paper hover:bg-forest-900">
                Save attendance
              </PendingButton>
              {isMeet && <p className="text-[13px] text-ink-500">Only marks you change are saved, and Meet won’t change them after that.</p>}
            </div>
          </form>
        )}
      </DashboardCard>

      {strangers.size > 0 && (
        <DashboardCard title="In the call, but not recognised">
          <p className="mb-3 text-sm text-ink-500">
            These people joined without a linked Google account, or under a different name. Mark the right student above by hand, and ask them to link Google on their Profile.
          </p>
          <ul className="divide-y divide-line">
            {[...strangers.values()].map((ss) => (
              <li key={ss[0].participant} className="py-2.5 text-sm">
                <span className="font-medium text-ink-900">{ss[0].displayName || "Unknown"}</span>
                <span className="text-ink-500">
                  {" "}({ss[0].kind === "anonymous" ? "not signed in to Google" : ss[0].kind === "phone" ? "phone" : "Google account"}) · {timeline(ss)}
                </span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      )}
    </div>
  );
}
