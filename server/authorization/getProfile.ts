import { createClient } from "@/src/domains/auth/server";
import { db } from "../db";
import { profiles } from "../../db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

export const getProfile = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) {
    return null;
  }
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return profile || null;
});

export const requireProfile = async () => {
  const profile = await getProfile();
  if (!profile) {
    throw new Error("Profile not found");
  }
  if (!profile.isActive) {
    throw new Error("Profile is deactivated");
  }
  return profile;
};
