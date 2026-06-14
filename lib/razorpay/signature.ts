import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify a Razorpay payment signature using HMAC-SHA256(order_id|payment_id).
 * Reference:
 * https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#step-4-store-fields-in-database
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret?: string;
}): boolean {
  const secret = params.keySecret ?? process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return false;
  }

  const expectedHex = createHmac("sha256", secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedHex, "hex");
  let receivedBuf: Buffer;
  try {
    receivedBuf = Buffer.from(params.signature, "hex");
  } catch {
    return false;
  }

  if (expectedBuf.length !== receivedBuf.length) {
    return false;
  }

  return timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * Verify a Razorpay webhook signature.
 *
 * Razorpay signs the **raw request body** with HMAC-SHA256 keyed by the
 * webhook secret configured in the dashboard (Settings → Webhooks), and sends
 * the hex digest in the `X-Razorpay-Signature` header.
 *
 * The raw body string must be passed exactly as received — re-serializing the
 * parsed JSON changes whitespace/key order and breaks the signature.
 */
export function verifyRazorpayWebhookSignature(params: {
  rawBody: string;
  signature: string | null;
  secret?: string;
}): boolean {
  const secret = params.secret ?? process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!(secret && params.signature)) {
    return false;
  }

  const expectedHex = createHmac("sha256", secret)
    .update(params.rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedHex, "hex");
  let receivedBuf: Buffer;
  try {
    receivedBuf = Buffer.from(params.signature, "hex");
  } catch {
    return false;
  }

  if (expectedBuf.length !== receivedBuf.length) {
    return false;
  }

  return timingSafeEqual(expectedBuf, receivedBuf);
}
