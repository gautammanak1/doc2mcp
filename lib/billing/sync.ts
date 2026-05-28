import "server-only";

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

export type SyncResult = {
  ok: boolean;
  synced: number;
  planId: PlanId | "free";
  status: string | null;
  reason?: string;
};

/**
 * Mirror one Stripe subscription into our DB. Used by the webhook AND by the
 * manual /api/stripe/sync recovery endpoint, so both code paths upsert
 * identically.
 */
export async function syncStripeSubscription(
  sub: Stripe.Subscription,
  metadataOverride?: Stripe.Metadata | Record<string, string>
): Promise<{ planId: PlanId; status: string } | null> {
  const metadata = metadataOverride ?? sub.metadata;

  const planMeta = metadata?.plan;
  const cycleMeta = metadata?.cycle;
  const userIdMeta = metadata?.userId;

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  let userId = userIdMeta ?? null;
  if (!userId) {
    const dbUser = await getUserByStripeCustomerId(customerId);
    userId = dbUser?.id ?? null;
  }
  if (!userId) {
    return null;
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

  return { planId: plan, status };
}

/**
 * Mark an existing subscription as canceled when Stripe emits the deletion
 * event. Skips silently if we don't have a record (the user was never synced).
 */
export async function markSubscriptionCanceled(sub: Stripe.Subscription) {
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

/**
 * Pull every subscription for a Stripe customer and mirror it locally. Used
 * as a recovery path when the webhook didn't fire (missing/wrong
 * STRIPE_WEBHOOK_SECRET, local dev without `stripe listen`, etc.).
 */
export async function syncSubscriptionsForCustomer(
  stripeCustomerId: string
): Promise<SyncResult> {
  const stripe = getStripe();

  const list = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "all",
    limit: 10,
    expand: ["data.items.data.price"],
  });

  if (list.data.length === 0) {
    return {
      ok: true,
      synced: 0,
      planId: "free",
      status: null,
      reason: "no_subscriptions",
    };
  }

  // Prefer the most recently created active/trialing sub; fall back to most
  // recent overall.
  const prioritized = [...list.data].sort((a, b) => {
    const aActive = a.status === "active" || a.status === "trialing" ? 1 : 0;
    const bActive = b.status === "active" || b.status === "trialing" ? 1 : 0;
    if (aActive !== bActive) {
      return bActive - aActive;
    }
    return b.created - a.created;
  });

  let synced = 0;
  let primary: { planId: PlanId; status: string } | null = null;
  for (const sub of prioritized) {
    const result = await syncStripeSubscription(sub);
    if (result) {
      synced += 1;
      if (!primary) {
        primary = result;
      }
    }
  }

  if (!primary) {
    return {
      ok: false,
      synced,
      planId: "free",
      status: null,
      reason: "missing_user_metadata",
    };
  }

  return {
    ok: true,
    synced,
    planId: primary.planId,
    status: primary.status,
  };
}

function getSubscriptionPeriod(sub: Stripe.Subscription) {
  // Stripe moved current_period_start/end onto each SubscriptionItem in
  // recent API versions; the legacy top-level fields are still set on
  // older subs. Read whichever is available.
  const raw = sub as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
    cancel_at_period_end?: boolean;
  };

  const item = sub.items?.data?.[0] as
    | (Stripe.SubscriptionItem & {
        current_period_start?: number;
        current_period_end?: number;
      })
    | undefined;

  const startEpoch = raw.current_period_start ?? item?.current_period_start;
  const endEpoch = raw.current_period_end ?? item?.current_period_end;

  return {
    start: startEpoch ? new Date(startEpoch * 1000) : null,
    end: endEpoch ? new Date(endEpoch * 1000) : null,
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
