"use server";

import { createClient } from "./server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { eq } from "drizzle-orm";
import { blockedFor, clear, clientIp, hit, waitText, type Limit } from "@/server/security/rateLimit";
import { passwordLink } from "./links";
import { emailService } from "../email/service";

const MINUTE = 60_000;

// Failed logins: 5 per email and 20 per network in 15 minutes. A successful login clears the email's count.
const loginLimits = (email: string, ip: string): Limit[] => [
  { key: `login:email:${email}`, max: 5, windowMs: 15 * MINUTE },
  { key: `login:ip:${ip}`, max: 20, windowMs: 15 * MINUTE },
];

export async function signInAction(_prev: { error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const limits = loginLimits(email, await clientIp());
  const wait = await blockedFor(limits);
  if (wait > 0) {
    return { error: `Too many wrong attempts. Try again in ${waitText(wait)}, or reset your password.` };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "over_request_rate_limit") {
      return { error: "Too many attempts right now. Wait a minute and try again." };
    }
    await hit(limits);
    if (error.code === "email_not_confirmed") return { error: "This account isn't set up yet. Use the link in your welcome email, or reset your password." };
    return { error: "That email and password don't match. Check them and try again, or reset your password." };
  }

  await clear(limits[0].key);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/sign-in");
}

import { getProfile } from "@/server/authorization/getProfile";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  return getProfile();
}

/** After a password change: lift the wrong-password lockout for the signed-in account, so the new password works straight away. */
export async function clearLoginLockoutAction() {
  const user = await getCurrentUser();
  if (user?.email) await clear(`login:email:${user.email.toLowerCase()}`);
}

/**
 * Emails a password reset link from Saarthi Classes (not Supabase), pointing at our own /reset-password.
 * Always reports success so nobody can probe which emails have accounts.
 * Limited to 3 per email and 10 per network an hour.
 */
export async function forgotPasswordAction(_prev: { sent?: boolean; error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address" };

  const limits: Limit[] = [
    { key: `reset:email:${email}`, max: 3, windowMs: 60 * MINUTE },
    { key: `reset:ip:${await clientIp()}`, max: 10, windowMs: 60 * MINUTE },
  ];
  const wait = await blockedFor(limits);
  if (wait > 0) return { error: `Too many reset requests. Check your inbox and spam folder, or try again in ${waitText(wait)}.` };
  await hit(limits);

  const resetUrl = await passwordLink(email, "recovery");
  if (resetUrl) {
    const [p] = await db.select({ name: profiles.fullName }).from(profiles).where(eq(profiles.email, email)).limit(1);
    const r = await emailService.sendPasswordReset(email, { name: p?.name ?? null, resetUrl });
    if (!r.success) console.error("[forgot password] email failed:", r.error);
  }
  return { sent: true };
}
