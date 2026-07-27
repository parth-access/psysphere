"use server";

import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { revalidatePath } from "next/cache";

export async function createTeacherAction(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;

  if (!fullName || !email) {
    throw new Error("Teacher Full Name and Registered Email are required.");
  }

  const id = crypto.randomUUID();

  await db.insert(profiles).values({
    id,
    fullName,
    email,
    role: "teacher",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  revalidatePath("/dashboard/teachers");
  revalidatePath("/dashboard");
}
