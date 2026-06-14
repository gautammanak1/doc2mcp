import { getPeriodWindow, isBillingCycle, isPlanId } from "@/lib/billing/plans";
import { upsertSubscriptionFromRazorpay } from "@/lib/db/queries";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay/signature";

/**
 * Razorpay webhook receiver.
 *
 * Server-to-server source of truth for activating plans. The browser
 * `verify-payment` call can be lost (user closes the tab, network drop), so
 * this webhook guarantees the subscription is recorded once Razorpay captures
 * the payment.
 *
 * Configure in Razorpay dashboard → Settings → Webhooks:
 *   - URL: https://doc2mcp.site/api/razorpay/webhook
 *   - Secret: RAZORPAY_WEBHOOK_SECRET (must match the Vercel env var)
 *   - Events: payment.captured, order.paid
 */
type RazorpayEntity = {
  id?: string;
  order_id?: string;
  amount?: number | string;
  currency?: string;
  notes?: Record<string, unknown>;
};

type RazorpayWebhookBody = {
  event?: string;
  payload?: {
    payment?: { entity?: RazorpayEntity };
    order?: { entity?: RazorpayEntity };
  };
};

const HANDLED_EVENTS = new Set(["payment.captured", "order.paid"]);

function toNumber(value: number | string | undefined): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number(value);
  }
  return 0;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureOk = verifyRazorpayWebhookSignature({
    rawBody,
    signature: request.headers.get("x-razorpay-signature"),
  });

  if (!signatureOk) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let body: RazorpayWebhookBody;
  try {
    body = JSON.parse(rawBody) as RazorpayWebhookBody;
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Always ack non-billing events so Razorpay stops retrying them.
  if (!(body.event && HANDLED_EVENTS.has(body.event))) {
    return Response.json({ ok: true, ignored: body.event ?? "unknown" });
  }

  const payment = body.payload?.payment?.entity;
  const order = body.payload?.order?.entity;
  const notes = payment?.notes ?? order?.notes ?? {};

  const userId = typeof notes.userId === "string" ? notes.userId : null;
  const plan = typeof notes.plan === "string" ? notes.plan : null;
  const cycle = typeof notes.cycle === "string" ? notes.cycle : null;

  // Without owner attribution we can't safely assign a plan. Ack so Razorpay
  // stops retrying, but log for manual reconciliation.
  if (!(userId && plan && cycle && isPlanId(plan) && isBillingCycle(cycle))) {
    console.error("Razorpay webhook missing plan attribution:", {
      event: body.event,
      hasUserId: Boolean(userId),
      plan,
      cycle,
    });
    return Response.json({ ok: true, skipped: "missing_attribution" });
  }

  const orderId = payment?.order_id ?? order?.id;
  const paymentId = payment?.id;
  if (!(orderId && paymentId)) {
    return Response.json({ ok: true, skipped: "missing_ids" });
  }

  const amount = toNumber(payment?.amount ?? order?.amount);
  const currency = payment?.currency ?? order?.currency ?? "INR";
  const period = getPeriodWindow(cycle);

  try {
    await upsertSubscriptionFromRazorpay({
      userId,
      plan,
      billingCycle: cycle,
      status: "active",
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpayCustomerId: null,
      amount,
      currency,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      cancelAtPeriodEnd: true,
    });
  } catch (error) {
    console.error("Razorpay webhook upsert failed:", error);
    return Response.json(
      { error: "Could not record subscription" },
      {
        status: 500,
      }
    );
  }

  return Response.json({ ok: true });
}
