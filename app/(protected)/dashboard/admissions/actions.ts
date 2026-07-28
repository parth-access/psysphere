"use server";

import { admissionService } from "@/src/domains/admissions/service";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { admissions } from "@/db/schema/core/admissions";
import { eq } from "drizzle-orm";
import { requireRole } from "@/server/authorization/requireRole";
import { z } from "zod";

// Zod validation schemas
const idSchema = z.string().uuid("Invalid Admission ID format");

const scheduleSchema = z.object({
  id: z.string().uuid("Invalid Admission ID format"),
  teacherId: z.string().uuid("Invalid Teacher ID format"),
  demoDate: z.string().min(1, "Demo date is required"),
  demoTime: z.string().min(1, "Demo time is required"),
  meetingUrl: z.string().url("Invalid meeting URL format"),
});

const notesSchema = z.object({
  id: z.string().uuid("Invalid Admission ID format"),
  notes: z.string().max(4000, "Notes cannot exceed 4000 characters"),
});

export async function approveAdmissionAction(id: string) {
  await requireRole(["admin"]);
  const validatedId = idSchema.parse(id);
  
  await admissionService.approveDemo(validatedId);
  
  revalidatePath("/dashboard/admissions");
  revalidatePath(`/dashboard/admissions/${validatedId}`);
}

export async function rejectAdmissionAction(id: string) {
  await requireRole(["admin"]);
  const validatedId = idSchema.parse(id);
  
  await admissionService.reject(validatedId);
  
  revalidatePath("/dashboard/admissions");
  revalidatePath(`/dashboard/admissions/${validatedId}`);
}

export async function convertAdmissionAction(id: string) {
  await requireRole(["admin"]);
  const validatedId = idSchema.parse(id);
  
  await admissionService.convertToStudent(validatedId);
  
  revalidatePath("/dashboard/admissions");
  revalidatePath(`/dashboard/admissions/${validatedId}`);
}

export async function scheduleDemoAction(
  id: string,
  teacherId: string,
  demoDate: string,
  demoTime: string,
  meetingUrl: string
) {
  await requireRole(["admin"]);
  
  const validated = scheduleSchema.parse({
    id,
    teacherId,
    demoDate,
    demoTime,
    meetingUrl,
  });
  
  await admissionService.scheduleDemo(
    validated.id,
    validated.teacherId,
    validated.demoDate,
    validated.demoTime,
    validated.meetingUrl
  );
  
  revalidatePath("/dashboard/admissions");
  revalidatePath(`/dashboard/admissions/${validated.id}`);
}

export async function scheduleDemoFormAction(formData: FormData) {
  await requireRole(["admin"]);
  
  const rawId = formData.get("id") as string;
  const rawTeacherId = formData.get("teacherId") as string;
  const rawDemoDate = formData.get("demoDate") as string;
  const rawDemoTime = formData.get("demoTime") as string;
  const rawMeetingUrl = formData.get("meetingUrl") as string;
  
  const validated = scheduleSchema.parse({
    id: rawId,
    teacherId: rawTeacherId,
    demoDate: rawDemoDate,
    demoTime: rawDemoTime,
    meetingUrl: rawMeetingUrl,
  });
  
  await admissionService.scheduleDemo(
    validated.id,
    validated.teacherId,
    validated.demoDate,
    validated.demoTime,
    validated.meetingUrl
  );
  
  revalidatePath("/dashboard/admissions");
  revalidatePath(`/dashboard/admissions/${validated.id}`);
}

export async function markDemoCompletedAction(id: string) {
  await requireRole(["admin"]);
  const validatedId = idSchema.parse(id);
  
  await admissionService.markDemoCompleted(validatedId);
  
  revalidatePath("/dashboard/admissions");
  revalidatePath(`/dashboard/admissions/${validatedId}`);
}

export async function saveAdmissionNotesAction(formData: FormData) {
  await requireRole(["admin"]);
  
  const rawId = formData.get("id") as string;
  const rawNotes = formData.get("notes") as string;
  
  const validated = notesSchema.parse({
    id: rawId,
    notes: rawNotes,
  });
  
  await db.update(admissions)
    .set({ notes: validated.notes, updatedAt: new Date() })
    .where(eq(admissions.id, validated.id));
    
  revalidatePath(`/dashboard/admissions/${validated.id}`);
}
