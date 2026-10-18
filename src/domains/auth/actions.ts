"use server";

import { createClient } from "./server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { eq } from "drizzle-orm";

export async function signInAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

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

/** Sends a password reset email. Always reports success so emails can't be probed. */
export async function forgotPasswordAction(_prev: { sent?: boolean; error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address" };
  const supabase = await createClient();
  const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${base}/reset-password` });
  if (error) console.error("[forgot password]", error.message);
  return { sent: true };
}
