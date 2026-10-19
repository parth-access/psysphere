"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { studentProfiles } from "@/db/schema/core/studentProfiles";
import { requireRole } from "@/server/authorization/requireRole";
import { createClient } from "@/src/domains/auth/server";

export type ProfileState = { ok?: string; error?: string };

const detailsSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  guardianName: z.string().trim().max(100).optional(),
  guardianPhone: z.string().trim().max(20).optional(),
  guardianEmail: z.string().trim().toLowerCase().email("Enter a valid parent email").optional().or(z.literal("")),
});

export async function updateDetailsAction(_p: ProfileState, formData: FormData): Promise<ProfileState> {
  const me = await requireRole(["admin", "teacher", "student"]);
  const parsed = detailsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const v = parsed.data;
  await db.update(profiles).set({ fullName: v.fullName, updatedAt: new Date() }).where(eq(profiles.id, me.id));
  if (me.role === "student") {
    await db
      .update(studentProfiles)
      .set({ guardianName: v.guardianName || null, guardianPhone: v.guardianPhone || null, guardianEmail: v.guardianEmail || null, updatedAt: new Date() })
      .where(eq(studentProfiles.profileId, me.id));
  }
  revalidatePath("/dashboard", "layout");
  return { ok: "Saved." };
}

const pwSchema = z
  .object({ password: z.string().min(8, "Use at least 8 characters").max(72), confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "The two passwords don’t match", path: ["confirm"] });

export async function changePasswordAction(_p: ProfileState, formData: FormData): Promise<ProfileState> {
  await requireRole(["admin", "teacher", "student"]);
  const parsed = pwSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  return { ok: "Password changed." };
}
