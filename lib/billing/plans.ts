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
  /** Total charge per billing period in USD cents */
  prices: Record<BillingCycle, number>;
  entitlements: PlanEntitlements;
};

export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    prices: {
      monthly: 500,
      biannual: 2400,
      yearly: 3600,
    },
    entitlements: {
      mcpConversionsPerMonth: 20,
      maxPagesPerSite: 80,
      privateProjects: false,
      recrawlHours: null,
      teammates: 1,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    prices: {
      monthly: 2000,
      biannual: 9600,
      yearly: 15_600,
    },
    entitlements: {
      mcpConversionsPerMonth: -1,
      maxPagesPerSite: 500,
      privateProjects: true,
      recrawlHours: 24,
      teammates: 1,
    },
  },
  team: {
    id: "team",
    name: "Team",
    prices: {
      monthly: 5000,
      biannual: 24_000,
      yearly: 39_600,
    },
    entitlements: {
      mcpConversionsPerMonth: -1,
      maxPagesPerSite: 2000,
      privateProjects: true,
      recrawlHours: 6,
      teammates: 5,
    },
  },
};

export const FREE_ENTITLEMENTS: PlanEntitlements = {
  mcpConversionsPerMonth: 20,
  maxPagesPerSite: 80,
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

export function getStripeRecurring(cycle: BillingCycle) {
  if (cycle === "yearly") {
    return { interval: "year" as const, interval_count: 1 };
  }
  if (cycle === "biannual") {
    return { interval: "month" as const, interval_count: 6 };
  }
  return { interval: "month" as const, interval_count: 1 };
}
