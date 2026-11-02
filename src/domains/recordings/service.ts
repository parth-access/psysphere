import { after } from "next/server";
import { and, eq, inArray, lt, or, isNull } from "drizzle-orm";
import { db } from "@/db";
import { classRecordings } from "@/db/schema/academic/classRecordings";
import { classSessions } from "@/db/schema/academic/classSessions";
import { batches } from "@/db/schema/core/batches";
import { enrollments } from "@/db/schema/core/enrollments";
import { profiles } from "@/db/schema/core/profiles";
import { deleteDriveFile, driveReady, getDriveVideo, listDriveFiles } from "@/server/integrations/googleDrive";
import { appUrl } from "@/src/domains/joining/tokens";
import { emailService } from "@/src/domains/email/service";
import { formatIST } from "@/lib/ids";
import { RECORDING_HOURS } from "./limits";

const RECHECK_MS = 20_000;
/** Drive takes minutes, so a video still not playable after this never will be. */
const GIVE_UP_MS = 24 * 3_600_000;
/** An upload that never got recorded here is only cleared after this long, so one still finishing is left alone. */
const ORPHAN_MS = 24 * 3_600_000;
const EMAIL_GAP_MS = 600;

export type Recording = typeof classRecordings.$inferSelect;

export async function recordingsFor(sessionIds: string[]) {
  if (sessionIds.length === 0) return new Map<string, Recording>();
  const rows = await db.select().from(classRecordings).where(inArray(classRecordings.sessionId, sessionIds));
  return new Map(rows.map((r) => [r.sessionId, r]));
}

async function emailBatch(recording: Recording, expiresAt: Date) {
  const [session] = await db
    .select({ batchId: classSessions.batchId, title: classSessions.title, batchName: batches.name })
    .from(classSessions)
    .innerJoin(batches, eq(batches.id, classSessions.batchId))
    .where(eq(classSessions.id, recording.sessionId));
  if (!session) return;
  const students = await db
    .select({ name: profiles.fullName, email: profiles.email })
    .from(enrollments)
    .innerJoin(profiles, eq(profiles.id, enrollments.studentProfileId))
    .where(and(eq(enrollments.batchId, session.batchId), eq(enrollments.status, "active"), eq(profiles.isActive, true)));
  for (const s of students) {
    await emailService.sendRecordingReady(
      s.email,
      {
        studentName: s.name,
        classTitle: session.title,
        batchName: session.batchName,
        untilText: formatIST(expiresAt),
        watchUrl: appUrl(`/dashboard/recordings/${recording.sessionId}`),
      },
      recording.id
    );
    await new Promise((r) => setTimeout(r, EMAIL_GAP_MS));
  }
}

async function checkProcessing(recording: Recording, now: Date) {
  const video = await getDriveVideo(recording.driveFileId);
  if (!video || (!video.playable && now.getTime() - recording.updatedAt.getTime() > GIVE_UP_MS)) {
    if (video) await deleteDriveFile(recording.driveFileId);
    await db.update(classRecordings).set({ status: "failed", deletedAt: now, updatedAt: now }).where(eq(classRecordings.id, recording.id));
    return;
  }
  if (!video.playable) {
    await db.update(classRecordings).set({ checkedAt: now }).where(eq(classRecordings.id, recording.id));
    return;
  }
  const expiresAt = new Date(now.getTime() + RECORDING_HOURS * 3_600_000);
  // Only one of several pages opened at once gets a row back, so the batch is emailed once.
  const won = await db
    .update(classRecordings)
    .set({ status: "ready", availableFrom: now, expiresAt, checkedAt: now, updatedAt: now })
    .where(and(eq(classRecordings.id, recording.id), eq(classRecordings.status, "processing")))
    .returning({ id: classRecordings.id });
  if (won.length > 0) {
    after(() => emailBatch(recording, expiresAt).catch((err) => console.error("[recordings] email failed:", err)));
  }
}

async function deleteExpired(recording: Recording, now: Date) {
  try {
    await deleteDriveFile(recording.driveFileId);
    await db.update(classRecordings).set({ status: "expired", deletedAt: now, deleteError: null, updatedAt: now }).where(eq(classRecordings.id, recording.id));
  } catch (err) {
    console.error("[recordings] delete failed:", err);
    await db.update(classRecordings).set({ deleteError: String((err as Error).message ?? err).slice(0, 500), updatedAt: now }).where(eq(classRecordings.id, recording.id));
  }
}

/**
 * Starts the 24 hours on videos Drive has finished processing, and deletes the ones whose time is up.
 * Pages call this so it happens promptly; the nightly job catches whatever nobody opened a page for.
 * A problem with Google never stops a page from loading.
 */
export async function settleRecordings(now = new Date()) {
  try {
    const due = await db
      .select()
      .from(classRecordings)
      .where(
        or(
          and(eq(classRecordings.status, "ready"), lt(classRecordings.expiresAt, now)),
          and(eq(classRecordings.status, "processing"), or(isNull(classRecordings.checkedAt), lt(classRecordings.checkedAt, new Date(now.getTime() - RECHECK_MS))))
        )
      );
    for (const r of due) {
      if (r.status === "ready") await deleteExpired(r, now);
      else await checkProcessing(r, now).catch((err) => console.error("[recordings] processing check failed:", err));
    }
  } catch (err) {
    console.error("[recordings] could not settle:", err);
  }
}

/** Removes files in Drive that no recording points to, such as an upload whose save never completed. */
export async function clearOrphanFiles(now = new Date()) {
  if (!(await driveReady())) return { removed: 0 };
  const files = await listDriveFiles();
  const keep = new Set(
    (await db.select({ id: classRecordings.driveFileId }).from(classRecordings).where(inArray(classRecordings.status, ["processing", "ready"]))).map((r) => r.id)
  );
  let removed = 0;
  for (const f of files) {
    if (keep.has(f.id) || now.getTime() - f.createdAt.getTime() < ORPHAN_MS) continue;
    await deleteDriveFile(f.id);
    removed++;
  }
  return { removed };
}
