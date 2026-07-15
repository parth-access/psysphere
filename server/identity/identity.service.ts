import type { UserJSON, DeletedObjectJSON } from "@clerk/nextjs/server";
import { syncProfile } from "./syncProfile";
import { updateProfile } from "./updateProfile";
import { deleteProfile } from "./deleteProfile";
import { logger } from "../logger";
import { IdentitySyncError } from "../errors";

export const identityService = {
  syncCreatedUser: async (user: UserJSON) => {
    logger.info(`Syncing created user: ${user.id}`);
    try {
      await syncProfile(user);
    } catch (error: any) {
      throw new IdentitySyncError(`Failed to sync created user ${user.id}: ${error.message}`);
    }
  },

  syncUpdatedUser: async (user: UserJSON) => {
    logger.info(`Syncing updated user: ${user.id}`);
    try {
      await updateProfile(user);
    } catch (error: any) {
      throw new IdentitySyncError(`Failed to sync updated user ${user.id}: ${error.message}`);
    }
  },

  syncDeletedUser: async (deletedObject: DeletedObjectJSON) => {
    logger.info(`Syncing deleted user: ${deletedObject.id}`);
    try {
      await deleteProfile(deletedObject);
    } catch (error: any) {
      throw new IdentitySyncError(`Failed to sync deleted user ${deletedObject.id}: ${error.message}`);
    }
  }
};
