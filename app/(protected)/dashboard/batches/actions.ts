"use server";

import { db } from "@/db";
import { batches } from "@/db/schema/core/batches";
import { revalidatePath } from "next/cache";

export async function createBatchAction(formData: FormData) {
  const name = formData.get("name") as string;
  const classLevel = formData.get("classLevel") as "class_11" | "class_12";
  const academicYear = formData.get("academicYear") as string;
  const schedule = formData.get("schedule") as string;

  if (!name || !classLevel || !academicYear) {
    throw new Error("Missing required fields for batch creation.");
  }

  await db.insert(batches).values({
    name,
    classLevel,
    academicYear,
    schedule: schedule || null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  revalidatePath("/dashboard/batches");
  revalidatePath("/dashboard");
}
