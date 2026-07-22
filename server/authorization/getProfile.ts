import { auth } from "@clerk/nextjs/server";
import { db } from "../db";
import { profiles } from "../../db/schema";
import { eq } from "drizzle-orm";

export const getProfile = async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.clerkId, userId))
    .limit(1);
  return profile || null;
};

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
