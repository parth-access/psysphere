"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { classRecordings } from "@/db/schema/academic/classRecordings";
import { classSessions } from "@/db/schema/academic/classSessions";
import { requireRole } from "@/server/authorization/requireRole";
import { canManageBatch } from "@/server/authorization/access";
import { deleteDriveFile, driveReady, driveSpace, getDriveVideo, shareForViewing, startDriveUpload } from "@/server/integrations/googleDrive";
import { MAX_RECORDING_BYTES, isWatchable, videoTypeOf } from "@/src/domains/recordings/limits";
import { formatBytes } from "@/src/domains/assignments/limits";

type Failed = { error: string };

const NEEDS_RECONNECT = "Google needs reconnecting before recordings can be uploaded. An admin can do this in Settings.";

function refresh() {
  revalidatePath("/dashboard/classes");
  revalidatePath("/dashboard/my-classes");
}

/** The class, if this teacher or admin may manage it. */
async function manageableClass(sessionId: string): Promise<Failed | { me: { id: string }; session: typeof classSessions.$inferSelect }> {
  const me = await requireRole(["admin", "teacher"]);
  if (!z.string().uuid().safeParse(sessionId).success) return { error: "Not allowed." };
  const [session] = await db.select().from(classSessions).where(eq(classSessions.id, sessionId));
  if (!session || !(await canManageBatch(me, session.batchId))) return { error: "Not allowed." };
  return { me, session };
}

/** Checks the file and opens an upload the browser sends straight to Drive. */
export async function startRecordingUploadAction(input: { sessionId: string; fileName: string; bytes: number }): Promise<{ uploadUrl: string } | Failed> {
  const found = await manageableClass(input.sessionId);
  if ("error" in found) return { error: found.error };
  const { session } = found;
  const now = new Date();
  if (session.status === "cancelled" || session.startsAt > now) return { error: "You can add a recording once the class has started." };

  const mimeType = videoTypeOf(input.fileName);
  if (!mimeType) return { error: "Please choose a video: MP4, MOV, WebM or MKV." };
  if (!Number.isSafeInteger(input.bytes) || input.bytes <= 0) return { error: "That file looks empty." };
  if (input.bytes > MAX_RECORDING_BYTES) {
    return { error: `That file is ${formatBytes(input.bytes)}, and the limit is ${formatBytes(MAX_RECORDING_BYTES)}. The recording guide has settings that make it smaller.` };
  }

  const [existing] = await db.select().from(classRecordings).where(eq(classRecordings.sessionId, session.id));
  if (existing && (existing.status === "processing" || isWatchable(existing, now))) return { error: "This class already has a recording. Delete it first." };

  if (!(await driveReady())) return { error: NEEDS_RECONNECT };
  const origin = (await headers()).get("origin");
  if (!origin) return { error: "The upload couldn't start. Please refresh the page and try again." };

  try {
    const space = await driveSpace();
    if (space.limit !== null && space.limit - space.used < input.bytes) {
      return { error: `Google Drive only has ${formatBytes(Math.max(0, space.limit - space.used))} free, which isn't enough for this file.` };
    }
    const extension = input.fileName.split(".").pop()?.toLowerCase();
    const uploadUrl = await startDriveUpload({
      name: `class-recording-${crypto.randomUUID().slice(0, 8)}.${extension}`,
      mimeType,
      bytes: input.bytes,
      origin,
      sessionId: session.id,
    });
    return { uploadUrl };
  } catch (err) {
    console.error("[recordings] could not start an upload:", err);
    return { error: "Google Drive didn't accept the upload. Please try again in a moment." };
  }
}

/** Called once Drive has the whole file. Checks it's the upload we opened, then shares it for viewing. */
export async function finishRecordingUploadAction(input: { sessionId: string; driveFileId: string; fileName: string }): Promise<{ ok: true } | Failed> {
  const found = await manageableClass(input.sessionId);
  if ("error" in found) return { error: found.error };
  const { me, session } = found;
  try {
    const video = await getDriveVideo(input.driveFileId);
    if (!video || video.sessionId !== session.id) return { error: "That upload couldn't be found. Please try again." };
    if (video.bytes > MAX_RECORDING_BYTES || !video.mimeType.startsWith("video/")) {
      await deleteDriveFile(input.driveFileId);
      return { error: "That file wasn't accepted. Please choose a video under the size limit." };
    }
    await shareForViewing(input.driveFileId);
    const now = new Date();
    const row = {
      driveFileId: input.driveFileId,
      fileName: input.fileName.slice(0, 200),
      bytes: video.bytes,
      status: "processing" as const,
      availableFrom: null,
      expiresAt: null,
      checkedAt: null,
      deletedAt: null,
      deleteError: null,
      uploadedBy: me.id,
      updatedAt: now,
    };
    await db.insert(classRecordings).values({ sessionId: session.id, ...row }).onConflictDoUpdate({ target: classRecordings.sessionId, set: row });
  } catch (err) {
    console.error("[recordings] could not finish an upload:", err);
    return { error: "The video reached Google Drive, but saving it didn't finish. Please try again." };
  }
  refresh();
  return { ok: true };
}

/** Hides the recording straight away. If Drive can't delete it now, the expiry job keeps trying. */
export async function deleteRecordingAction(formData: FormData) {
  const found = await manageableClass(String(formData.get("sessionId") ?? ""));
  if ("error" in found) return;
  const [recording] = await db.select().from(classRecordings).where(eq(classRecordings.sessionId, found.session.id));
  if (!recording || recording.deletedAt) return;
  const now = new Date();
  try {
    await deleteDriveFile(recording.driveFileId);
    await db.update(classRecordings).set({ status: "deleted", deletedAt: now, deleteError: null, updatedAt: now }).where(eq(classRecordings.id, recording.id));
  } catch (err) {
    console.error("[recordings] delete failed:", err);
    await db.update(classRecordings).set({ status: "ready", expiresAt: now, deleteError: String((err as Error).message ?? err).slice(0, 500), updatedAt: now }).where(eq(classRecordings.id, recording.id));
  }
  refresh();
}
