"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/server/authorization/requireRole";
import {
  createWorkshop,
  sendJoinInvites,
  sendWorkshopReminders,
  setAttendance,
  setWorkshopPublished,
  WorkshopError,
} from "@/src/domains/workshops/service";

const createSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(120),
  description: z.string().trim().max(2000).optional().transform((v) => v || null),
  classLevel: z.enum(["class_11", "class_12", "both"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a time"),
  durationMin: z.coerce.number().int().min(15).max(240),
  capacity: z.coerce.number().int().positive().nullable(),
});

export type CreateWorkshopState = { error?: string };

export async function createWorkshopAction(_prev: CreateWorkshopState, formData: FormData): Promise<CreateWorkshopState> {
  const admin = await requireRole(["admin"]);
  const parsed = createSchema.safeParse({
    ...Object.fromEntries(formData),
    capacity: formData.get("capacity") ? formData.get("capacity") : null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const v = parsed.data;

  const startsAt = new Date(`${v.date}T${v.time}:00+05:30`);
  if (startsAt < new Date()) return { error: "The workshop must be in the future." };
  const endsAt = new Date(startsAt.getTime() + v.durationMin * 60_000);

  let id: string;
  try {
    ({ id } = await createWorkshop({
      title: v.title,
      description: v.description,
      classLevel: v.classLevel === "both" ? null : v.classLevel,
      startsAt,
      endsAt,
      capacity: v.capacity,
      createdBy: admin.id,
    }));
  } catch (err) {
    console.error("[create workshop]", err);
    return { error: err instanceof WorkshopError ? err.message : "Couldn't create the workshop. Check the Google Calendar connection." };
  }
  revalidatePath("/dashboard/workshops");
  revalidatePath("/workshops");
  redirect(`/dashboard/workshops/${id}`);
}

const idSchema = z.string().uuid();

export async function togglePublishedAction(formData: FormData) {
  await requireRole(["admin"]);
  const id = idSchema.parse(formData.get("id"));
  await setWorkshopPublished(id, formData.get("publish") === "1");
  revalidatePath(`/dashboard/workshops/${id}`);
  revalidatePath("/workshops");
}

export async function toggleAttendanceAction(formData: FormData) {
  await requireRole(["admin"]);
  const workshopId = idSchema.parse(formData.get("workshopId"));
  const registrationId = idSchema.parse(formData.get("registrationId"));
  await setAttendance(registrationId, formData.get("attended") === "1");
  revalidatePath(`/dashboard/workshops/${workshopId}`);
}

export async function sendRemindersAction(formData: FormData) {
  await requireRole(["admin"]);
  const id = idSchema.parse(formData.get("id"));
  const r = await sendWorkshopReminders(id);
  revalidatePath(`/dashboard/workshops/${id}`);
  redirect(`/dashboard/workshops/${id}?notice=${encodeURIComponent(`Reminder sent to ${r.sent} of ${r.total} students`)}`);
}

export async function sendJoinInvitesAction(formData: FormData) {
  await requireRole(["admin"]);
  const id = idSchema.parse(formData.get("id"));
  const r = await sendJoinInvites(id, formData.get("onlyAttended") === "on");
  revalidatePath(`/dashboard/workshops/${id}`);
  redirect(`/dashboard/workshops/${id}?notice=${encodeURIComponent(`Join invitation sent to ${r.sent} of ${r.total} students`)}`);
}
