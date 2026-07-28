"use server";

import { db } from "@/db";
import { classSessions } from "@/db/schema/academic/classSessions";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/authorization/requireRole";
import { z } from "zod";

const createClassSessionSchema = z.object({
  batchId: z.string().uuid("Invalid Batch ID format"),
  title: z.string().min(1, "Session title is required").max(100, "Title too long"),
  topicTitle: z.string().min(1, "Topic title is required").max(200, "Topic too long"),
  meetingUrl: z.string().url("Invalid meeting URL format"),
  dateStr: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (must be YYYY-MM-DD)"),
  timeStr: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (must be HH:MM)"),
  durationMin: z.number().int().positive("Duration must be a positive number"),
});

export async function createClassSessionAction(formData: FormData) {
  // Allow admins and teachers to manage class sessions
  await requireRole(["admin", "teacher"]);

  const rawBatchId = formData.get("batchId") as string;
  const rawTitle = formData.get("title") as string;
  const rawTopicTitle = formData.get("topicTitle") as string;
  const rawMeetingUrl = formData.get("meetingUrl") as string;
  const rawDateStr = formData.get("date") as string;
  const rawTimeStr = formData.get("time") as string;
  const rawDurationMin = Number(formData.get("duration") || "60");

  const validated = createClassSessionSchema.parse({
    batchId: rawBatchId,
    title: rawTitle,
    topicTitle: rawTopicTitle,
    meetingUrl: rawMeetingUrl,
    dateStr: rawDateStr,
    timeStr: rawTimeStr,
    durationMin: rawDurationMin,
  });

  const startsAt = new Date(`${validated.dateStr}T${validated.timeStr}:00`);
  const endsAt = new Date(startsAt.getTime() + validated.durationMin * 60 * 1000);

  await db.insert(classSessions).values({
    batchId: validated.batchId,
    title: validated.title,
    topicTitle: validated.topicTitle,
    meetingUrl: validated.meetingUrl,
    startsAt,
    endsAt,
    status: "scheduled",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/dashboard/classes");
  revalidatePath("/dashboard");
}
