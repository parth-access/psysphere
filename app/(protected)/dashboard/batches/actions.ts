"use server";

import { db } from "@/db";
import { batches } from "@/db/schema/core/batches";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/authorization/requireRole";
import { z } from "zod";

const createBatchSchema = z.object({
  name: z.string().min(1, "Batch name is required").max(100, "Batch name too long"),
  classLevel: z.enum(["class_11", "class_12"]),
  academicYear: z.string().min(1, "Academic year is required").max(20, "Academic year too long"),
  schedule: z.string().max(500, "Schedule description too long").nullable().optional(),
});

export async function createBatchAction(formData: FormData) {
  // Ensure only authorized admins can create batches
  await requireRole(["admin"]);

  const rawName = formData.get("name") as string;
  const rawClassLevel = formData.get("classLevel") as string;
  const rawAcademicYear = formData.get("academicYear") as string;
  const rawSchedule = formData.get("schedule") as string;

  const validated = createBatchSchema.parse({
    name: rawName,
    classLevel: rawClassLevel,
    academicYear: rawAcademicYear,
    schedule: rawSchedule || null,
  });

  await db.insert(batches).values({
    name: validated.name,
    classLevel: validated.classLevel,
    academicYear: validated.academicYear,
    schedule: validated.schedule || null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/dashboard/batches");
  revalidatePath("/dashboard");
}
