"use server";

import { admissionService } from "@/src/domains/admissions/service";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { admissions } from "@/db/schema/core/admissions";
import { eq } from "drizzle-orm";

export async function approveAdmissionAction(id: string) {
  await admissionService.approveDemo(id);
  revalidatePath("/dashboard/admissions");
  revalidatePath(`/dashboard/admissions/${id}`);
}

export async function rejectAdmissionAction(id: string) {
  await admissionService.reject(id);
  revalidatePath("/dashboard/admissions");
  revalidatePath(`/dashboard/admissions/${id}`);
}

export async function convertAdmissionAction(id: string) {
  await admissionService.convertToStudent(id);
  revalidatePath("/dashboard/admissions");
  revalidatePath(`/dashboard/admissions/${id}`);
}

export async function scheduleDemoAction(id: string, teacherId: string, demoDate: string) {
  await admissionService.scheduleDemo(id, teacherId, demoDate);
  revalidatePath("/dashboard/admissions");
  revalidatePath(`/dashboard/admissions/${id}`);
}

export async function scheduleDemoFormAction(formData: FormData) {
  const id = formData.get("id") as string;
  const teacherId = formData.get("teacherId") as string;
  const demoDate = formData.get("demoDate") as string;
  
  if (id && teacherId && demoDate) {
    await admissionService.scheduleDemo(id, teacherId, demoDate);
    revalidatePath("/dashboard/admissions");
    revalidatePath(`/dashboard/admissions/${id}`);
  }
}

export async function saveAdmissionNotesAction(formData: FormData) {
  const id = formData.get("id") as string;
  const notesText = formData.get("notes") as string;

  if (id && notesText !== null) {
    await db.update(admissions)
      .set({ notes: notesText, updatedAt: new Date() })
      .where(eq(admissions.id, id));
    revalidatePath(`/dashboard/admissions/${id}`);
  }
}
