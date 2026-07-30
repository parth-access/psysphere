"use server";

import { db } from "@/db";
import { enrollments } from "@/db/schema/core/enrollments";
import { batches } from "@/db/schema/core/batches";
import { studentProfiles } from "@/db/schema/core/studentProfiles";
import { profiles } from "@/db/schema/core/profiles";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/authorization/requireRole";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const enrollStudentSchema = z.object({
  batchId: z.string().uuid("Invalid Batch ID format"),
  studentProfileId: z.string().uuid("Invalid Student Profile ID format"),
});

export async function enrollStudentAction(formData: FormData) {
  await requireRole(["admin"]);

  const rawBatchId = formData.get("batchId") as string;
  const rawStudentProfileId = formData.get("studentProfileId") as string;

  const validated = enrollStudentSchema.parse({
    batchId: rawBatchId,
    studentProfileId: rawStudentProfileId,
  });

  // Verify batch exists
  const [batch] = await db
    .select()
    .from(batches)
    .where(eq(batches.id, validated.batchId))
    .limit(1);

  if (!batch) {
    throw new Error("Cohort batch does not exist");
  }

  // Verify student is active and has student role
  const [student] = await db
    .select()
    .from(profiles)
    .where(
      and(
        eq(profiles.id, validated.studentProfileId),
        eq(profiles.role, "student"),
        eq(profiles.isActive, true)
      )
    )
    .limit(1);

  if (!student) {
    throw new Error("Student profile is not active or does not exist");
  }

  // Verify student has student_profiles entry
  const [studentProfile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.profileId, validated.studentProfileId))
    .limit(1);

  if (!studentProfile) {
    throw new Error("Student does not have a valid student academic profile.");
  }

  // Check if student is already enrolled in this batch
  const [existingEnrollment] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.batchId, validated.batchId),
        eq(enrollments.studentProfileId, validated.studentProfileId)
      )
    )
    .limit(1);

  if (existingEnrollment) {
    throw new Error("Student is already enrolled in this batch cohort.");
  }

  // Perform enrollment
  await db.insert(enrollments).values({
    batchId: validated.batchId,
    studentProfileId: validated.studentProfileId,
    status: "active",
    enrolledAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath(`/dashboard/batches/${validated.batchId}`);
  revalidatePath(`/dashboard/batches`);
}

const updateTeacherSchema = z.object({
  batchId: z.string().uuid("Invalid Batch ID format"),
  teacherId: z.string().uuid("Invalid Teacher ID format"),
});

export async function updateBatchTeacherAction(formData: FormData) {
  await requireRole(["admin"]);

  const rawBatchId = formData.get("batchId") as string;
  const rawTeacherId = formData.get("teacherId") as string;

  const validated = updateTeacherSchema.parse({
    batchId: rawBatchId,
    teacherId: rawTeacherId,
  });

  // Verify referenced teacher record is active and is a teacher
  const [teacher] = await db
    .select()
    .from(profiles)
    .where(
      and(
        eq(profiles.id, validated.teacherId),
        eq(profiles.role, "teacher"),
        eq(profiles.isActive, true)
      )
    )
    .limit(1);

  if (!teacher) {
    throw new Error("Selected teacher does not exist or is inactive");
  }

  await db
    .update(batches)
    .set({
      teacherId: validated.teacherId,
      updatedAt: new Date(),
    })
    .where(eq(batches.id, validated.batchId));

  revalidatePath(`/dashboard/batches/${validated.batchId}`);
  revalidatePath(`/dashboard/batches`);
}

export async function removeStudentFromBatchAction(formData: FormData) {
  await requireRole(["admin"]);

  const enrollmentId = formData.get("enrollmentId") as string;
  const batchId = formData.get("batchId") as string;

  if (!enrollmentId || !batchId) {
    throw new Error("Missing parameters");
  }

  await db
    .delete(enrollments)
    .where(eq(enrollments.id, enrollmentId));

  revalidatePath(`/dashboard/batches/${batchId}`);
  revalidatePath(`/dashboard/batches`);
}
