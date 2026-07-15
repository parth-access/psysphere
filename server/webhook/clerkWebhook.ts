import type { WebhookEvent } from "@clerk/nextjs/server";
import { identityService } from "../identity/identity.service";
import { logger } from "../logger";

export const handleClerkWebhookEvent = async (evt: WebhookEvent) => {
  const eventType = evt.type;

  switch (eventType) {
    case "user.created":
      await identityService.syncCreatedUser(evt.data);
      break;
    case "user.updated":
      await identityService.syncUpdatedUser(evt.data);
      break;
    case "user.deleted":
      await identityService.syncDeletedUser(evt.data);
      break;
    default:
      logger.warn(`Unhandled Clerk Event: ${eventType}`);
      break;
  }
};
