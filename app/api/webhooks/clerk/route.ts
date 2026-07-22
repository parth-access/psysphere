import { NextResponse } from "next/server";
import { verifyClerkWebhook } from "../../../../server/webhook/verifyWebhook";
import { handleClerkWebhookEvent } from "../../../../server/webhook/clerkWebhook";
import { WebhookVerificationError, IdentitySyncError } from "../../../../server/errors";
import { logger } from "../../../../server/logger";

export async function POST(req: Request) {
  try {
    const evt = await verifyClerkWebhook(req);

    // Dispatch the event
    await handleClerkWebhookEvent(evt);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error instanceof WebhookVerificationError) {
      logger.warn(`Webhook verification failed: ${error.message}`);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    if (error instanceof IdentitySyncError) {
      logger.error(`Identity sync failed: ${error.message}`);
      return NextResponse.json(
        { error: "Identity Sync Error" },
        { status: 500 }
      );
    }
    
    logger.error("[ClerkWebhookRoute] Internal Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
