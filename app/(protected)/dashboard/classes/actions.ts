"use server";

import { db } from "@/db";
import { classSessions } from "@/db/schema/academic/classSessions";
import { batches } from "@/db/schema/core/batches";
import { profiles } from "@/db/schema/core/profiles";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/authorization/requireRole";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getConnectedClient, createCalendarEvent, generateDeterministicUuid, findCalendarEventBySessionId, deleteCalendarEvent } from "@/server/integrations/google";

const createClassSessionSchema = z.object({
  batchId: z.string().uuid("Invalid Batch ID format"),
  title: z.string().min(1, "Session title is required").max(100, "Title too long"),
  topicTitle: z.string().min(1, "Topic title is required").max(200, "Topic too long"),
  dateStr: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (must be YYYY-MM-DD)"),
  timeStr: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (must be HH:MM)"),
  durationMin: z.number().int().positive("Duration must be a positive number"),
});

export async function createClassSessionAction(formData: FormData) {
  // Allow admins and teachers to manage class sessions
  const profile = await requireRole(["admin", "teacher"]);

  const rawBatchId = formData.get("batchId") as string;
  const rawTitle = formData.get("title") as string;
  const rawTopicTitle = formData.get("topicTitle") as string;
  const rawDateStr = formData.get("date") as string;
  const rawTimeStr = formData.get("time") as string;
  const rawDurationMin = Number(formData.get("duration") || "60");

  const validated = createClassSessionSchema.parse({
    batchId: rawBatchId,
    title: rawTitle,
    topicTitle: rawTopicTitle,
    dateStr: rawDateStr,
    timeStr: rawTimeStr,
    durationMin: rawDurationMin,
  });

  // Verify Google Calendar is connected
  const connection = await getConnectedClient();
  if (!connection) {
    if (profile.role === "admin") {
      throw new Error(
        "Google Calendar integration is not connected. Please connect and authorize the institutional Google account in the Settings page."
      );
    } else {
      throw new Error(
        "Google Calendar service is currently offline. Please contact your administrator to configure and connect the system Google account."
      );
    }
  }

  // Fetch target batch
  const [batch] = await db
    .select()
    .from(batches)
    .where(eq(batches.id, validated.batchId))
    .limit(1);

  if (!batch) {
    throw new Error("Cohort batch does not exist");
  }

  // Teacher-specific authorization check: must be assigned to this batch
  if (profile.role === "teacher" && batch.teacherId !== profile.id) {
    throw new Error("Unauthorized: You are not assigned as the instructor for this cohort batch.");
  }

  const sessionTeacherId = batch.teacherId;
  if (!sessionTeacherId) {
    throw new Error("Cannot schedule a class for a batch with no assigned instructor.");
  }

  // Verify referenced teacher is active and is a teacher
  const [teacher] = await db
    .select()
    .from(profiles)
    .where(
      and(
        eq(profiles.id, sessionTeacherId),
        eq(profiles.role, "teacher"),
        eq(profiles.isActive, true)
      )
    )
    .limit(1);

  if (!teacher) {
    throw new Error("Assigned teacher is inactive or does not exist.");
  }

  // Explicit time semantics parsed relative to India timezone (Asia/Kolkata: UTC+5:30)
  const startsAt = new Date(`${validated.dateStr}T${validated.timeStr}:00+05:30`);
  const endsAt = new Date(startsAt.getTime() + validated.durationMin * 60 * 1000);

  // Pre-generate stable session UUID BEFORE creating Google Calendar event
  const sessionId = generateDeterministicUuid(`${validated.batchId}:${startsAt.getTime()}`);

  // 1. Prevent duplicate class session creation in db
  const [duplicateSession] = await db
    .select()
    .from(classSessions)
    .where(eq(classSessions.id, sessionId))
    .limit(1);

  if (duplicateSession) {
    // Gracefully return if session is already stored
    return;
  }

  let googleEventId: string | null = null;
  let meetUrl: string | null = null;
  let isNewEvent = false;

  // 2. High operational resiliency: check if event already exists on Google Calendar by private extended property to avoid duplicate events on retry
  const existingGoogleEvent = await findCalendarEventBySessionId(sessionId);
  if (existingGoogleEvent) {
    googleEventId = existingGoogleEvent.eventId;
    meetUrl = existingGoogleEvent.meetUrl;
  } else {
    // 3. Create the Google Calendar event with Google Meet videoconference
    const createdEvent = await createCalendarEvent({
      sessionId,
      title: validated.title,
      batchName: batch.name,
      topicTitle: validated.topicTitle,
      startsAt,
      endsAt,
      teacherName: teacher.fullName,
    });
    googleEventId = createdEvent.eventId;
    meetUrl = createdEvent.meetUrl;
    isNewEvent = true;
  }

  // 4. Record class session details in our database with robust compensation
  try {
    await db.insert(classSessions).values({
      id: sessionId,
      batchId: validated.batchId,
      teacherId: sessionTeacherId,
      title: validated.title,
      topicTitle: validated.topicTitle,
      meetingUrl: meetUrl!,
      startsAt,
      endsAt,
      status: "scheduled",
      googleEventId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (dbError: any) {
    if (isNewEvent && googleEventId) {
      console.warn(`Database insert failed for sessionId ${sessionId}. Attempting compensation by deleting Google Calendar event ${googleEventId}...`);
      try {
        await deleteCalendarEvent(googleEventId);
        console.log(`Successfully compensated by deleting Google Calendar event ${googleEventId} for sessionId ${sessionId}.`);
      } catch (compensationError: any) {
        console.error(`COMPENSATION FAILURE: Failed to delete Google Calendar event ${googleEventId} during recovery for sessionId ${sessionId}. Manual intervention may be required. Error details: ${compensationError.message || compensationError}`);
        throw new Error(
          `Database insertion failed and automatic cleanup of the Google Calendar event failed. Manual reconciliation may be necessary. DB Error: ${dbError.message || dbError}`
        );
      }
    }
    throw new Error(`Failed to save class session in database. DB Error: ${dbError.message || dbError}`);
  }

  revalidatePath("/dashboard/classes");
  revalidatePath("/dashboard");
}
