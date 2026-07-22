import { db } from "../db";
import { profiles } from "../../db/schema";
import type { UserJSON } from "@clerk/nextjs/server";
import { mapClerkUserToProfile } from "./profileMapper";
import { logger } from "../logger";

export const syncProfile = async (clerkUser: UserJSON) => {
  const mappedProfile = mapClerkUserToProfile(clerkUser);
  
  try {
    // TODO: Wrap in db.transaction() when creating related records (e.g., audit log, student profile, notifications)
    await db.insert(profiles)
      .values({
        ...mappedProfile,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: profiles.clerkId,
        set: {
          email: mappedProfile.email,
          fullName: mappedProfile.fullName,
          avatarUrl: mappedProfile.avatarUrl,
          updatedAt: new Date(),
        }
      });
  } catch (error) {
    logger.error(`Error syncing profile for clerkId ${clerkUser.id}`, error);
    throw error;
  }
};
