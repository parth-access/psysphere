"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { studentProfiles } from "@/db/schema/core/studentProfiles";
import { requireRole } from "@/server/authorization/requireRole";
import { blockedFor, hit, waitText, type Limit } from "@/server/security/rateLimit";
import { createClient } from "@/src/domains/auth/server";
import { checkCurrentPassword } from "@/src/domains/auth/password";
import { AVATAR_TYPES, MAX_AVATAR_BYTES, deleteAvatar, uploadAvatar } from "@/src/domains/profile/avatars";
import { cancelEmailChange, emailTaken, requestEmailChange } from "@/src/domains/profile/emailChange";

/** `values` echoes what was typed when saving fails, so the form can show it again after React resets it. */
export type ProfileState = { ok?: string; error?: string; values?: Record<string, string> };

const ANYONE = ["admin", "teacher", "student"] as const;

/** Optional mobile number. A 10-digit Indian number is stored as "+91 98765 43210"; others keep their + and digits. */
const phone = (message: string) =>
  z
    .string()
    .trim()
    .optional()
    .transform((v, ctx) => {
      if (!v) return null;
      const digits = v.replace(/\D/g, "");
      const indian = v.startsWith("+") ? /^91([6-9]\d{9})$/.exec(digits) : /^(?:91|0)?([6-9]\d{9})$/.exec(digits);
      if (indian) return `+91 ${indian[1].slice(0, 5)} ${indian[1].slice(5)}`;
      if (v.startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
      ctx.addIssue({ code: "custom", message });
      return z.NEVER;
    });

const detailsSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  phone: phone("Enter a 10-digit mobile number, or one starting with + and the country code"),
  guardianName: z.string().trim().max(100).optional(),
  guardianPhone: phone("Enter a 10-digit mobile number for your parent"),
  guardianEmail: z.string().trim().toLowerCase().email("Enter a valid parent email").optional().or(z.literal("")),
});

export async function updateDetailsAction(_p: ProfileState, formData: FormData): Promise<ProfileState> {
  const me = await requireRole([...ANYONE]);
  const typed = Object.fromEntries([...formData].filter((e): e is [string, string] => typeof e[1] === "string"));
  const parsed = detailsSchema.safeParse(typed);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, values: typed };
  const v = parsed.data;
  await db.update(profiles).set({ fullName: v.fullName, phone: v.phone, updatedAt: new Date() }).where(eq(profiles.id, me.id));
  if (me.role === "student") {
    await db
      .update(studentProfiles)
      .set({ guardianName: v.guardianName || null, guardianPhone: v.guardianPhone, guardianEmail: v.guardianEmail || null, updatedAt: new Date() })
      .where(eq(studentProfiles.profileId, me.id));
  }
  revalidatePath("/dashboard", "layout");
  return { ok: "Saved." };
}

export async function uploadAvatarAction(_p: ProfileState, formData: FormData): Promise<ProfileState> {
  const me = await requireRole([...ANYONE]);
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo first." };
  if (!AVATAR_TYPES.includes(file.type)) return { error: "Use a JPG, PNG or WebP photo." };
  if (file.size > MAX_AVATAR_BYTES) return { error: "That photo is too large. Try a smaller one." };

  const limits: Limit[] = [{ key: `avatar:${me.id}`, max: 20, windowMs: 60 * 60_000 }];
  const wait = await blockedFor(limits);
  if (wait > 0) return { error: `You've changed your photo a lot. Try again in ${waitText(wait)}.` };
  await hit(limits);

  let path: string;
  try {
    path = await uploadAvatar(me.id, file);
  } catch (err) {
    console.error("[profile] photo upload failed", err);
    return { error: "We couldn't upload that photo. Try again." };
  }
  await db.update(profiles).set({ avatarUrl: path, updatedAt: new Date() }).where(eq(profiles.id, me.id));
  await deleteAvatar(me.avatarUrl);
  revalidatePath("/dashboard", "layout");
  return { ok: "Photo updated." };
}

export async function removeAvatarAction(): Promise<ProfileState> {
  const me = await requireRole([...ANYONE]);
  if (!me.avatarUrl) return {};
  await db.update(profiles).set({ avatarUrl: null, updatedAt: new Date() }).where(eq(profiles.id, me.id));
  await deleteAvatar(me.avatarUrl);
  revalidatePath("/dashboard", "layout");
  return { ok: "Photo removed." };
}

const emailSchema = z.object({
  newEmail: z.string().trim().toLowerCase().email("Enter a valid email address"),
  currentPassword: z.string().min(1, "Enter your current password"),
});

export async function requestEmailChangeAction(_p: ProfileState, formData: FormData): Promise<ProfileState> {
  const me = await requireRole([...ANYONE]);
  const parsed = emailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { newEmail, currentPassword } = parsed.data;
  if (newEmail === me.email.toLowerCase()) return { error: "That's already your login email." };

  const limits: Limit[] = [{ key: `email-change:${me.id}`, max: 3, windowMs: 60 * 60_000 }];
  const wait = await blockedFor(limits);
  if (wait > 0) return { error: `Too many requests. Try again in ${waitText(wait)}.` };

  const wrong = await checkCurrentPassword(me.id, me.email, currentPassword);
  if (wrong) return { error: wrong };
  if (await emailTaken(newEmail, me.id)) return { error: "That email is already used by another account." };

  await hit(limits);
  const sent = await requestEmailChange(me, newEmail);
  if (!sent.success) await cancelEmailChange(me.id);
  revalidatePath("/dashboard/profile");
  if (!sent.success) return { error: "We couldn't send the confirmation email. Check the address and try again." };
  return { ok: `We've sent a link to ${newEmail}. Open it to finish the change.` };
}

export async function cancelEmailChangeAction() {
  const me = await requireRole([...ANYONE]);
  await cancelEmailChange(me.id);
  revalidatePath("/dashboard/profile");
}

const pwSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    password: z.string().min(8, "Use at least 8 characters").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "The two passwords don’t match", path: ["confirm"] });

export async function changePasswordAction(_p: ProfileState, formData: FormData): Promise<ProfileState> {
  const me = await requireRole([...ANYONE]);
  const parsed = pwSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (parsed.data.password === parsed.data.currentPassword) return { error: "Choose a password different from your current one." };

  const wrong = await checkCurrentPassword(me.id, me.email, parsed.data.currentPassword);
  if (wrong) return { error: wrong };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  return { ok: "Password changed." };
}
