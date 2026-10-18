import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/server/integrations/razorpay";
import { finalizePaidOrder } from "@/src/domains/joining/service";

export const dynamic = "force-dynamic";

/**
 * Razorpay webhook (backup path in case the student closes the tab before
 * Checkout reports success). Subscribe to: payment.captured, order.paid
 * URL: https://classes.saarthilife.com/api/razorpay/webhook
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  let valid = false;
  try {
    valid = verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    console.error("[razorpay webhook] not configured:", err);
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }
  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const payment = event?.payload?.payment?.entity;

  if ((event.event === "payment.captured" || event.event === "order.paid") && payment?.order_id && payment?.id) {
    try {
      await finalizePaidOrder(payment.order_id, payment.id);
    } catch (err) {
      console.error("[razorpay webhook] finalize failed:", err);
      // 500 makes Razorpay retry later
      return NextResponse.json({ error: "finalize failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
