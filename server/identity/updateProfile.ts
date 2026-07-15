import { db } from "../db";
import { profiles } from "../../db/schema";
import { eq } from "drizzle-orm";
import type { UserJSON } from "@clerk/nextjs/server";
import { mapClerkUserToProfile } from "./profileMapper";
import { syncProfile } from "./syncProfile";
import { logger } from "../logger";

export const updateProfile = async (clerkUser: UserJSON) => {
  try {
    const existingProfiles = await db.select()
      .from(profiles)
      .where(eq(profiles.clerkId, clerkUser.id))
      .limit(1);

    if (existingProfiles.length === 0) {
      logger.info(`Profile not found for update, creating instead: ${clerkUser.id}`);
      await syncProfile(clerkUser);
      return;
    }

    const mappedProfile = mapClerkUserToProfile(clerkUser);
    
    // We only update mutable fields: email, fullName, avatarUrl, updatedAt
    // We DO NOT update: clerkId, role, createdAt
    // TODO: Wrap in db.transaction() if we need to update related profiles or audit logs
    
    await db.update(profiles)
      .set({
        email: mappedProfile.email,
        fullName: mappedProfile.fullName,
        avatarUrl: mappedProfile.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(profiles.clerkId, mappedProfile.clerkId));
  } catch (error) {
    logger.error(`Error updating profile for clerkId ${clerkUser.id}`, error);
    throw error;
  }
};
