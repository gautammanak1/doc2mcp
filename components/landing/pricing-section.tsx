"use client";

import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BillingCycle = "monthly" | "biannual" | "yearly";

type Plan = {
  id: string;
  name: string;
  tagline: string;
  price: Record<BillingCycle, number>;
  badge?: string;
  highlight?: boolean;
  features: string[];
  cta: { label: string; href: string };
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For trying doc2mcp on personal projects.",
    price: { monthly: 5, biannual: 4, yearly: 3 },
    features: [
      "20 MCP conversions / month",
      "Up to 80 pages per docs site",
      "Remote HTTP MCP for Cursor + Claude + Windsurf",
      "ask_documentation with ASI1",
      "Public projects",
      "Community support",
    ],
    cta: { label: "Start", href: "/chat" },
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For builders shipping AI products.",
    price: { monthly: 20, biannual: 16, yearly: 13 },
    badge: "Most popular",
    highlight: true,
    features: [
      "Unlimited MCP conversions",
      "Up to 500 pages per docs site",
      "Deep markdown extraction (.md, .mdx, llms.txt)",
      "Auto re-crawl every 24 hours",
      "Private projects",
      "Email support",
    ],
    cta: { label: "Go Pro", href: "/chat?plan=pro" },
  },
  {
    id: "team",
    name: "Team",
    tagline: "For teams operating internal docs at scale.",
    price: { monthly: 50, biannual: 40, yearly: 33 },
    features: [
      "Everything in Pro",
      "Up to 2 000 pages per docs site",
      "Auto re-crawl every 6 hours",
      "Up to 5 teammates",
      "Custom domain for MCP endpoints",
      "Priority support (24h SLA)",
    ],
    cta: { label: "Upgrade", href: "/chat?plan=team" },
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
  yearly: "Save 35%",
};

const CYCLE_SUFFIX: Record<BillingCycle, string> = {
  monthly: "/mo",
  biannual: "/mo billed every 6 mo",
  yearly: "/mo billed annually",
};

export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [isVisible, setIsVisible] = useState(false);
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
      className="relative py-16 sm:py-24 lg:py-32"
      id="pricing"
      ref={sectionRef}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <div className="mb-12 text-center sm:mb-16">
          <span className="inline-flex items-center gap-3 text-muted-foreground text-sm font-mono">
            <span className="h-px w-8 bg-foreground/30" />
            Pricing
            <span className="h-px w-8 bg-foreground/30" />
          </span>
          <h2
            className={cn(
              "mt-6 font-display text-3xl tracking-tight transition-all duration-700 sm:text-5xl lg:text-6xl",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
          >
            Simple, builder-friendly pricing.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every plan ships the same remote MCP. Bigger plans crawl more pages
            and re-crawl more often.
          </p>

          <div className="mt-8 flex w-full max-w-md flex-wrap items-center justify-center gap-2 rounded-full border border-border/60 bg-card/60 p-1 text-xs backdrop-blur-xl sm:max-w-none sm:flex-nowrap sm:justify-center">
            {(Object.keys(CYCLE_LABEL) as BillingCycle[]).map((c) => (
              <button
                className={cn(
                  "min-w-0 flex-1 rounded-full px-3 py-2 font-medium transition-all sm:flex-none sm:px-4",
                  cycle === c
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
                key={c}
                onClick={() => setCycle(c)}
                type="button"
              >
                {CYCLE_LABEL[c]}
                {CYCLE_DISCOUNT[c] ? (
                  <span className="ml-2 rounded-full bg-violet-500/20 px-2 py-0.5 font-mono text-[10px] text-violet-300">
                    {CYCLE_DISCOUNT[c]}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, index) => (
            <div
              className={cn(
                "relative flex flex-col gap-6 rounded-2xl border bg-card/40 p-6 backdrop-blur-xl transition-all duration-500",
                plan.highlight
                  ? "border-violet-500/40 shadow-[0_0_40px_oklch(0.55_0.2_280/15%)]"
                  : "border-border/40 hover:border-border/60",
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0"
              )}
              key={plan.id}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {plan.badge ? (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1 font-medium text-white text-xs">
                  <Sparkles className="size-3" />
                  {plan.badge}
                </span>
              ) : null}

              <div>
                <h3 className="font-display font-semibold text-2xl">
                  {plan.name}
                </h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  {plan.tagline}
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-4xl tracking-tight sm:text-5xl">
                  ${plan.price[cycle]}
                </span>
                <span className="text-muted-foreground text-xs">
                  {CYCLE_SUFFIX[cycle]}
                </span>
              </div>

              <ul className="flex flex-1 flex-col gap-2 text-sm">
                {plan.features.map((feature) => (
                  <li className="flex items-start gap-2" key={feature}>
                    <Check className="mt-0.5 size-4 shrink-0 text-violet-400" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "w-full",
                  plan.highlight
                    ? "bg-violet-500 text-white hover:bg-violet-500/90"
                    : ""
                )}
                size="lg"
                variant={plan.highlight ? "default" : "outline"}
              >
                <Link href={plan.cta.href}>{plan.cta.label}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-muted-foreground text-xs">
          All plans include unlimited MCP read calls from Cursor. Conversions
          are the crawl + analyze step that runs once per docs site. Cancel
          anytime.
        </p>
      </div>
    </section>
  );
}
