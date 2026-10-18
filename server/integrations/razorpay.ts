import crypto from "crypto";

/**
 * Minimal Razorpay client using the REST API directly (no SDK needed).
 * Docs: https://razorpay.com/docs/api/orders/
 */

export class RazorpayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RazorpayError";
  }
}

function getKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new RazorpayError("Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing).");
  }
  return { keyId, keySecret };
}

/** Public key id, safe to send to the browser for Checkout. */
export function getRazorpayKeyId() {
  return getKeys().keyId;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export async function createRazorpayOrder(params: {
  amountInr: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { keyId, keySecret } = getKeys();
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: Math.round(params.amountInr * 100), // paise
      currency: "INR",
      receipt: params.receipt.slice(0, 40),
      notes: params.notes,
    }),
    cache: "no-store",
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.id) {
    const reason = body?.error?.description || `HTTP ${res.status}`;
    throw new RazorpayError(`Could not create Razorpay order: ${reason}`);
  }
  return body as RazorpayOrder;
}

function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** Verifies the signature Razorpay Checkout returns after a successful payment. */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = getKeys();
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqualHex(expected, signature);
}

/** Verifies the X-Razorpay-Signature header on a webhook, using the raw request body. */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new RazorpayError("RAZORPAY_WEBHOOK_SECRET is not configured.");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
