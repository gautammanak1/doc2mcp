"use client";

import { Check, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RazorpayCheckoutButton } from "@/components/billing/razorpay-checkout-button";
import {
  type BillingCurrency,
  type BillingCycle,
  billingCycleMonths,
  formatMoney,
  getPlanPrice,
  type PlanId,
} from "@/lib/billing/plans";
import { useBillingCurrency } from "@/lib/billing/use-currency";
import { cn } from "@/lib/utils";

type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  badge?: string;
  highlight?: boolean;
  features: string[];
  ctaLabel: string;
};

type FreePlan = {
  id: "free";
  name: string;
  tagline: string;
  features: string[];
  ctaLabel: string;
};

const FREE_PLAN: FreePlan = {
  id: "free",
  name: "Free",
  tagline: "For tinkering, demos, and one-off experiments.",
  features: [
    "5 MCP conversions / month",
    "Up to 50 pages per docs site",
    "Remote HTTP MCP for Cursor + Claude",
    "ask_documentation with ASI1",
    "Community support",
  ],
  ctaLabel: "Start free",
};

const PLAN_COPY: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo devs shipping side-projects.",
    features: [
      "50 MCP conversions / month",
      "Up to 150 pages per docs site",
      "Remote HTTP MCP for Cursor + Claude + Windsurf",
      "Semantic toolkits + workflow inference",
      "Public projects",
      "Community support",
    ],
    ctaLabel: "Start Starter",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For builders shipping AI-native products.",
    badge: "Most popular",
    highlight: true,
    features: [
      "Unlimited MCP conversions",
      "Up to 750 pages per docs site",
      "Workflow AI (auth, payment, upload, webhook flows)",
      "Visual API graph + MCP playground",
      "Auto re-crawl every 24h · private projects",
      "Email support",
    ],
    ctaLabel: "Go Pro",
  },
  {
    id: "team",
    name: "Team",
    tagline: "For teams operating internal docs at scale.",
    features: [
      "Everything in Pro",
      "Up to 2,500 pages per docs site",
      "Auto re-crawl every 6h",
      "5 teammates · role-based access",
      "Custom domain for MCP endpoints",
      "Priority support (24h SLA)",
    ],
    ctaLabel: "Upgrade",
  },
];

const CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: "Monthly",
  biannual: "6 months",
  yearly: "Yearly",
};

const CYCLE_DISCOUNT: Record<BillingCycle, string | null> = {
  monthly: null,
  biannual: "Save 20%",
  yearly: "Save 40%",
};

const CYCLE_SUFFIX: Record<BillingCycle, string> = {
  monthly: "/mo",
  biannual: "/mo billed every 6 mo",
  yearly: "/mo billed annually",
};

/**
 * Convert a Razorpay-style total in minor units into the "per month"
 * headline shown on the pricing card.
 */
function monthlyHeadline(
  planId: PlanId,
  currency: BillingCurrency,
  cycle: BillingCycle
): string {
  const total = getPlanPrice(planId, currency, cycle);
  const months = billingCycleMonths(cycle);
  const perMonth = Math.round(total / months);
  return formatMoney(perMonth, currency);
}

export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [isVisible, setIsVisible] = useState(false);
  const { currency, setCurrency } = useBillingCurrency();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative py-20 sm:py-28"
      id="pricing"
      ref={sectionRef}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-12 text-center sm:mb-16">
          <span className="text-muted-foreground/60 text-xs sm:text-sm font-mono tracking-wider uppercase">
            PRICING PLANS
          </span>
          <h2
            className={cn(
              "mt-4 font-display text-3xl font-semibold tracking-tight text-foreground transition-all duration-700 sm:text-4xl lg:text-5xl",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
          >
            Simple, builder-friendly pricing.
          </h2>
          <p className="mt-4 text-muted-foreground text-sm max-w-lg mx-auto">
            Every plan deploy the same robust remote MCP interface. Select a tier based on page capacity and sync frequency.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            {/* Cycle Selector */}
            <div
              className="inline-flex w-full max-w-[360px] items-stretch gap-1 rounded-full border border-border/80 bg-card/65 p-1 text-xs backdrop-blur-md sm:w-auto sm:max-w-none"
              role="tablist"
            >
              {(Object.keys(CYCLE_LABEL) as BillingCycle[]).map((c) => (
                <button
                  aria-selected={cycle === c}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 font-medium transition-all duration-200 sm:flex-none",
                    cycle === c
                      ? "bg-[#e9eef6] text-[#1f1f1f] dark:bg-[#282a2d] dark:text-[#e3e3e3] shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  key={c}
                  onClick={() => setCycle(c)}
                  role="tab"
                  type="button"
                >
                  <span>{CYCLE_LABEL[c]}</span>
                  {CYCLE_DISCOUNT[c] ? (
                    <span
                      className={cn(
                        "shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[9px] tracking-wide",
                        cycle === c
                          ? "bg-primary/10 text-primary"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {CYCLE_DISCOUNT[c]}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* Currency Selector */}
            <fieldset className="m-0 inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/65 p-1 text-[10px] backdrop-blur-md">
              <legend className="sr-only">Currency</legend>
              {(["USD", "INR"] as BillingCurrency[]).map((cur) => (
                <button
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1 font-mono transition-all duration-200 text-xs",
                    currency === cur
                      ? "bg-[#e9eef6] text-[#1f1f1f] dark:bg-[#282a2d] dark:text-[#e3e3e3] shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  type="button"
                >
                  {cur === "USD" ? "$ USD" : "₹ INR"}
                </button>
              ))}
            </fieldset>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
          {/* Free Card */}
          <div
            className={cn(
              "relative flex flex-col gap-6 rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-xl transition-all duration-500 hover:border-border/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)]",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            )}
          >
            <div>
              <h3 className="font-display font-semibold text-foreground text-xl">
                {FREE_PLAN.name}
              </h3>
              <p className="mt-1.5 text-muted-foreground text-xs leading-relaxed">
                {FREE_PLAN.tagline}
              </p>
            </div>

            <div className="flex items-baseline gap-1 my-2">
              <span className="font-display font-bold text-4xl tracking-tight text-foreground">
                {currency === "USD" ? "$0" : "₹0"}
              </span>
              <span className="text-muted-foreground text-xs">
                / forever
              </span>
            </div>

            <ul className="flex flex-1 flex-col gap-2.5 text-xs">
              {FREE_PLAN.features.map((feature) => (
                <li className="flex items-start gap-2.5" key={feature}>
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[#4285f4]" />
                  <span className="text-muted-foreground leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              className="inline-flex h-10 items-center justify-center rounded-full border border-border/60 bg-transparent px-5 font-medium text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
              href="/register"
            >
              {FREE_PLAN.ctaLabel}
            </a>
          </div>

          {/* Premium Cards */}
          {PLAN_COPY.map((plan, index) => (
            <div
              className={cn(
                "relative flex flex-col gap-6 rounded-2xl border bg-card/45 p-6 backdrop-blur-xl transition-all duration-500 shadow-[0_4px_24px_rgba(0,0,0,0.02)]",
                plan.highlight
                  ? "border-[#4285f4]/35 dark:border-[#8ab4f8]/35 shadow-[0_0_24px_rgba(66,133,244,0.06)]"
                  : "border-border/50 hover:border-border/80",
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0"
              )}
              key={plan.id}
              style={{ transitionDelay: `${(index + 1) * 80}ms` }}
            >
              {plan.badge ? (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-[#4285f4] dark:bg-[#8ab4f8] px-3 py-1 font-semibold text-white dark:text-[#131314] text-[9px] uppercase tracking-wider shadow-sm">
                  {plan.badge}
                </span>
              ) : null}

              <div>
                <h3 className="font-display font-semibold text-foreground text-xl">
                  {plan.name}
                </h3>
                <p className="mt-1.5 text-muted-foreground text-xs leading-relaxed">
                  {plan.tagline}
                </p>
              </div>

              <div className="flex items-baseline gap-1 my-2">
                <span className="font-display font-bold text-4xl tracking-tight text-foreground">
                  {monthlyHeadline(plan.id, currency, cycle)}
                </span>
                <span className="text-muted-foreground text-xs font-mono">
                  {CYCLE_SUFFIX[cycle].split(" billed")[0]}
                </span>
              </div>
              
              <p className="-mt-3 font-mono text-[9px] text-muted-foreground/60 uppercase tracking-wider">
                Charged once as{" "}
                {formatMoney(getPlanPrice(plan.id, currency, cycle), currency)}
              </p>

              <ul className="flex flex-1 flex-col gap-2.5 text-xs">
                {plan.features.map((feature) => (
                  <li className="flex items-start gap-2.5" key={feature}>
                    <Check className={cn(
                      "mt-0.5 size-3.5 shrink-0",
                      plan.highlight ? "text-[#4285f4] dark:text-[#8ab4f8]" : "text-[#4285f4] dark:text-[#8ab4f8]"
                    )} />
                    <span className="text-muted-foreground leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <RazorpayCheckoutButton
                currency={currency}
                cycle={cycle}
                highlight={plan.highlight}
                label={plan.ctaLabel}
                planId={plan.id}
              />
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-muted-foreground/60 text-[10px] font-mono uppercase tracking-wider">
          Unlimited MCP reads included · Conversions run once per docs portal · Cancel anytime.
        </p>
      </div>
    </section>
  );
}
