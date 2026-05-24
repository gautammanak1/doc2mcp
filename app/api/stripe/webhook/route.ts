import type Stripe from "stripe";
import {
  type BillingCycle,
  isBillingCycle,
  isPlanId,
  type PlanId,
} from "@/lib/billing/plans";
import { getStripe } from "@/lib/billing/stripe";
import {
  getSubscriptionByStripeId,
  getUserByStripeCustomerId,
  upsertSubscriptionFromStripe,
} from "@/lib/db/queries";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session
      );
    } else if (event.type === "customer.subscription.updated") {
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
    } else if (event.type === "customer.subscription.deleted") {
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return Response.json({ error: "Handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}

async function handleCheckoutCompleted(
  checkoutSession: Stripe.Checkout.Session
) {
  const subscriptionId =
    typeof checkoutSession.subscription === "string"
      ? checkoutSession.subscription
      : checkoutSession.subscription?.id;

  if (!subscriptionId) {
    return;
  }

  const sub = await getStripe().subscriptions.retrieve(subscriptionId);
  await syncSubscription(sub, checkoutSession.metadata ?? undefined);
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  await syncSubscription(sub, sub.metadata);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const existing = await getSubscriptionByStripeId(sub.id);
  if (!existing) {
    return;
  }

  await upsertSubscriptionFromStripe({
    userId: existing.userId,
    plan: existing.plan as PlanId,
    billingCycle: existing.billingCycle as BillingCycle,
    status: "canceled",
    stripeCustomerId: existing.stripeCustomerId,
    stripeSubscriptionId: sub.id,
    currentPeriodStart: existing.currentPeriodStart,
    currentPeriodEnd: existing.currentPeriodEnd,
    cancelAtPeriodEnd: true,
  });
}

async function syncSubscription(
  sub: Stripe.Subscription,
  metadata?: Stripe.Metadata | Record<string, string>
) {
  const planMeta = metadata?.plan;
  const cycleMeta = metadata?.cycle;
  const userIdMeta = metadata?.userId;

  let userId = userIdMeta ?? null;
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  if (!userId) {
    const dbUser = await getUserByStripeCustomerId(customerId);
    userId = dbUser?.id ?? null;
  }

  if (!userId) {
    console.error("Webhook: could not resolve userId for subscription", sub.id);
    return;
  }

  const plan: PlanId = planMeta && isPlanId(planMeta) ? planMeta : "starter";
  const cycle: BillingCycle =
    cycleMeta && isBillingCycle(cycleMeta) ? cycleMeta : "monthly";

  const status = mapStripeStatus(sub.status);

  const period = getSubscriptionPeriod(sub);

  await upsertSubscriptionFromStripe({
    userId,
    plan,
    billingCycle: cycle,
    status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    currentPeriodStart: period.start,
    currentPeriodEnd: period.end,
    cancelAtPeriodEnd: period.cancelAtPeriodEnd,
  });
}

function getSubscriptionPeriod(sub: Stripe.Subscription) {
  const raw = sub as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
    cancel_at_period_end?: boolean;
  };

  return {
    start: raw.current_period_start
      ? new Date(raw.current_period_start * 1000)
      : null,
    end: raw.current_period_end
      ? new Date(raw.current_period_end * 1000)
      : null,
    cancelAtPeriodEnd: raw.cancel_at_period_end ?? false,
  };
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): "active" | "past_due" | "canceled" | "incomplete" | "trialing" {
  switch (status) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "trialing":
      return "trialing";
    default:
      return "incomplete";
  }
}
