"use server";

import { db } from "@/db";
import { classSessions } from "@/db/schema/academic/classSessions";
import { revalidatePath } from "next/cache";

export async function createClassSessionAction(formData: FormData) {
  const batchId = formData.get("batchId") as string;
  const title = formData.get("title") as string;
  const topicTitle = formData.get("topicTitle") as string;
  const meetingUrl = formData.get("meetingUrl") as string;
  const dateStr = formData.get("date") as string; // YYYY-MM-DD
  const timeStr = formData.get("time") as string; // HH:MM
  const durationMin = Number(formData.get("duration") || "60");

  if (!batchId || !title || !topicTitle || !meetingUrl || !dateStr || !timeStr) {
    throw new Error("Missing required fields for class session scheduling.");
  }

  const startsAt = new Date(`${dateStr}T${timeStr}:00`);
  const endsAt = new Date(startsAt.getTime() + durationMin * 60 * 1000);

  await db.insert(classSessions).values({
    batchId,
    title,
    topicTitle,
    meetingUrl,
    startsAt,
    endsAt,
    status: "scheduled",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  revalidatePath("/dashboard/classes");
  revalidatePath("/dashboard");
}
