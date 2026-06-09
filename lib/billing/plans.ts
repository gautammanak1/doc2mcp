export type PlanId = "starter" | "pro" | "team";
export type BillingCycle = "monthly" | "biannual" | "yearly";
export type BillingCurrency = "USD" | "INR";

export type PlanEntitlements = {
  mcpConversionsPerMonth: number;
  maxPagesPerSite: number;
  privateProjects: boolean;
  recrawlHours: number | null;
  teammates: number;
};

/**
 * Per-billing-cycle price in the smallest unit of the currency:
 *   - USD: cents (1 dollar = 100 cents)
 *   - INR: paise (1 rupee = 100 paise)
 *
 * Razorpay's Orders API expects `amount` in this same minor-unit form for
 * either currency.
 */
export type PriceMatrix = Record<BillingCurrency, Record<BillingCycle, number>>;

export type PlanConfig = {
  id: PlanId;
  name: string;
  prices: PriceMatrix;
  entitlements: PlanEntitlements;
};

export const SUPPORTED_CURRENCIES: BillingCurrency[] = ["USD", "INR"];
export const DEFAULT_CURRENCY: BillingCurrency = "USD";

/**
 * Pricing ladder.
 *
 * USD is the canonical price; INR rates are set in the same step pattern
 * so India users see a localized price instead of a brittle floating-point
 * FX conversion. Yearly = (monthly × discount × 12) so a single one-shot
 * Razorpay order covers the entire window.
 */
export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    prices: {
      USD: {
        monthly: 399, // $3.99
        biannual: 1914, // $3.19 × 6
        yearly: 2868, // $2.39 × 12
      },
      INR: {
        monthly: 29_900, // ₹299
        biannual: 143_400, // ₹239 × 6
        yearly: 214_800, // ₹179 × 12
      },
    },
    entitlements: {
      mcpConversionsPerMonth: 5,
      maxPagesPerSite: 50,
      privateProjects: false,
      recrawlHours: null,
      teammates: 1,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    prices: {
      USD: {
        monthly: 1499, // $14.99
        biannual: 7194, // $11.99 × 6
        yearly: 11_988, // $9.99 × 12
      },
      INR: {
        monthly: 99_900, // ₹999
        biannual: 479_400, // ₹799 × 6
        yearly: 718_800, // ₹599 × 12
      },
    },
    entitlements: {
      mcpConversionsPerMonth: 10,
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
      USD: {
        monthly: 3999, // $39.99
        biannual: 19_194, // $31.99 × 6
        yearly: 31_188, // $25.99 × 12
      },
      INR: {
        monthly: 299_900, // ₹2,999
        biannual: 1_439_400, // ₹2,399 × 6
        yearly: 2_159_400, // ₹1,799 × 12
      },
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
  mcpConversionsPerMonth: 1,
  maxPagesPerSite: 30,
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

export function isBillingCurrency(value: string): value is BillingCurrency {
  return value === "USD" || value === "INR";
}

/**
 * Look up a plan's price for a given currency/cycle. Falls back to USD when
 * an unsupported currency is requested.
 */
export function getPlanPrice(
  planId: PlanId,
  currency: BillingCurrency,
  cycle: BillingCycle
): number {
  const plan = PLANS[planId];
  const matrix = plan.prices[currency] ?? plan.prices[DEFAULT_CURRENCY];
  return matrix[cycle];
}

/** Razorpay's minimum amount per currency, in minor units. */
export function getMinAmount(currency: BillingCurrency): number {
  return currency === "USD" ? 50 : 100;
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

/**
 * Format an amount in minor units (cents / paise) as a pretty money string.
 *
 *   formatMoney(1499, "USD") → "$14.99"
 *   formatMoney(29_900, "INR") → "₹299"
 */
export function formatMoney(minorUnits: number, currency: BillingCurrency) {
  const major = minorUnits / 100;
  if (currency === "INR") {
    if (Number.isInteger(major)) {
      return `₹${major.toLocaleString("en-IN")}`;
    }
    return `₹${major.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${major.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Convenience: legacy callers expecting INR-only formatting. */
export function formatInrPaise(paise: number): string {
  return formatMoney(paise, "INR");
}
