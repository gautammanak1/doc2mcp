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
      monthly: 399,
      biannual: 1914,
      yearly: 2868,
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
      monthly: 1499,
      biannual: 7194,
      yearly: 11_988,
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
      monthly: 3999,
      biannual: 19_194,
      yearly: 31_188,
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

export function getStripeRecurring(cycle: BillingCycle) {
  if (cycle === "yearly") {
    return { interval: "year" as const, interval_count: 1 };
  }
  if (cycle === "biannual") {
    return { interval: "month" as const, interval_count: 6 };
  }
  return { interval: "month" as const, interval_count: 1 };
}
