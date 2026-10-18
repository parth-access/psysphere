"use server";

import { createOrderForPayToken, finalizePaidOrder, getRequestByPayToken, JoinError } from "@/src/domains/joining/service";
import { verifyCheckoutSignature } from "@/server/integrations/razorpay";

export async function startPaymentAction(token: string) {
  try {
    return { ok: true as const, order: await createOrderForPayToken(token) };
  } catch (err) {
    console.error("[pay] create order", err);
    return { ok: false as const, message: err instanceof JoinError ? err.message : "Couldn't start the payment. Please try again." };
  }
}

export async function confirmPaymentAction(
  token: string,
  payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
) {
  const found = await getRequestByPayToken(token);
  // After payment the token is cleared, so a missing request is fine if the webhook got there first.
  if (found && found.request.razorpayOrderId !== payment.razorpay_order_id) {
    return { ok: false as const, message: "Payment doesn't match this order." };
  }
  if (!verifyCheckoutSignature(payment.razorpay_order_id, payment.razorpay_payment_id, payment.razorpay_signature)) {
    return { ok: false as const, message: "We couldn't verify the payment. If money was deducted, it will be confirmed automatically within a few minutes." };
  }
  try {
    await finalizePaidOrder(payment.razorpay_order_id, payment.razorpay_payment_id);
    return { ok: true as const };
  } catch (err) {
    console.error("[pay] finalize", err);
    return { ok: false as const, message: "Payment received, but we hit a problem setting up your account. We'll fix it and email you." };
  }
}
