export type PlanId = "starter" | "pro" | "team";
export type BillingCycle = "monthly" | "biannual" | "yearly";

export type PlanEntitlements = {
  mcpConversionsPerMonth: number;
  maxPagesPerSite: number;
  privateProjects: boolean;
  recrawlHours: number | null;
  teammates: number;
};

export type PlanConfig = {
  id: PlanId;
  name: string;
  /**
   * Charge per billing period, in the smallest unit of the configured
   * currency (INR paise — 1 rupee = 100 paise). Razorpay's Orders API
   * expects amounts in paise.
   */
  prices: Record<BillingCycle, number>;
  entitlements: PlanEntitlements;
};

export const BILLING_CURRENCY = "INR" as const;

/**
 * Pricing is in INR paise. Sensible India-friendly targets that roughly
 * mirror the previous USD ladder ($3.99 / $14.99 / $39.99).
 *
 * Yearly is shown as the total annual charge so a single Razorpay order
 * covers the full window.
 */
export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    prices: {
      monthly: 29_900, // ₹299/mo
      biannual: 143_400, // ₹239/mo × 6
      yearly: 214_800, // ₹179/mo × 12
    },
    entitlements: {
      mcpConversionsPerMonth: 50,
      maxPagesPerSite: 150,
      privateProjects: false,
      recrawlHours: null,
      teammates: 1,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    prices: {
      monthly: 99_900, // ₹999/mo
      biannual: 479_400, // ₹799/mo × 6
      yearly: 718_800, // ₹599/mo × 12
    },
    entitlements: {
      mcpConversionsPerMonth: -1,
      maxPagesPerSite: 750,
      privateProjects: true,
      recrawlHours: 24,
      teammates: 1,
    },
  },
  team: {
    id: "team",
    name: "Team",
    prices: {
      monthly: 299_900, // ₹2,999/mo
      biannual: 1_439_400, // ₹2,399/mo × 6
      yearly: 2_159_400, // ₹1,799/mo × 12
    },
    entitlements: {
      mcpConversionsPerMonth: -1,
      maxPagesPerSite: 2500,
      privateProjects: true,
      recrawlHours: 6,
      teammates: 5,
    },
  },
};

export const FREE_ENTITLEMENTS: PlanEntitlements = {
  mcpConversionsPerMonth: 5,
  maxPagesPerSite: 50,
  privateProjects: false,
  recrawlHours: null,
  teammates: 1,
};

export function isPlanId(value: string): value is PlanId {
  return value === "starter" || value === "pro" || value === "team";
}

export function isBillingCycle(value: string): value is BillingCycle {
  return value === "monthly" || value === "biannual" || value === "yearly";
}

/**
 * How many months a single Razorpay payment unlocks. Used to compute
 * `currentPeriodEnd` when verifying a payment.
 */
export function billingCycleMonths(cycle: BillingCycle): number {
  if (cycle === "yearly") {
    return 12;
  }
  if (cycle === "biannual") {
    return 6;
  }
  return 1;
}

export function getPeriodWindow(cycle: BillingCycle, from: Date = new Date()) {
  const start = new Date(from);
  const end = new Date(from);
  end.setUTCMonth(end.getUTCMonth() + billingCycleMonths(cycle));
  return { start, end };
}

/** Pretty INR amount: 29_900 → "₹299". */
export function formatInrPaise(paise: number): string {
  const rupees = paise / 100;
  if (Number.isInteger(rupees)) {
    return `₹${rupees.toLocaleString("en-IN")}`;
  }
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
