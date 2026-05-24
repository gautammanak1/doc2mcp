import "server-only";

import { cache } from "react";
import type {
  BillingCycle,
  PlanEntitlements,
  PlanId,
} from "@/lib/billing/plans";
import { FREE_ENTITLEMENTS, PLANS } from "@/lib/billing/plans";
import {
  countUserConversionsThisMonth,
  getActiveSubscriptionByUserId,
} from "@/lib/db/queries";

export type UserPlanInfo = {
  planId: PlanId | "free";
  billingCycle: BillingCycle | null;
  entitlements: PlanEntitlements;
  status: string | null;
  currentPeriodEnd: Date | null;
};

/**
 * Resolve a user's current plan + entitlements, memoized per request so
 * dashboard layout + page + nav don't all re-hit the Subscription table.
 */
export const getUserPlan = cache(
  async (userId: string): Promise<UserPlanInfo> => {
    const sub = await getActiveSubscriptionByUserId(userId);

    if (!sub || (sub.status !== "active" && sub.status !== "trialing")) {
      return {
        planId: "free",
        billingCycle: null,
        entitlements: FREE_ENTITLEMENTS,
        status: sub?.status ?? null,
        currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      };
    }

    const planId = sub.plan as PlanId;
    const config = PLANS[planId];

    return {
      planId,
      billingCycle: sub.billingCycle as BillingCycle,
      entitlements: config.entitlements,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
    };
  }
);

export class EntitlementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EntitlementError";
  }
}

export async function assertCanStartConversion(userId: string) {
  const plan = await getUserPlan(userId);

  const limit = plan.entitlements.mcpConversionsPerMonth;
  if (limit < 0) {
    return plan;
  }

  const used = await countUserConversionsThisMonth(userId);
  if (used >= limit) {
    throw new EntitlementError(
      `Monthly conversion limit reached (${limit}). Upgrade your plan at /pricing.`
    );
  }

  return plan;
}

export function getMaxPagesForPlan(plan: UserPlanInfo): number {
  return plan.entitlements.maxPagesPerSite;
}
