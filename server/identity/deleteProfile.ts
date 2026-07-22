import { db } from "../db";
import { profiles } from "../../db/schema";
import { eq } from "drizzle-orm";
import type { DeletedObjectJSON } from "@clerk/nextjs/server";
import { logger } from "../logger";

export const deleteProfile = async (deletedUser: DeletedObjectJSON) => {
  if (!deletedUser.id) return;

  try {
    // TODO: Wrap in db.transaction() to also soft-delete related records if necessary
    await db.update(profiles)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(profiles.clerkId, deletedUser.id));
  } catch (error) {
    logger.error(`Error deleting profile for clerkId ${deletedUser.id}`, error);
    throw error;
  }
};
