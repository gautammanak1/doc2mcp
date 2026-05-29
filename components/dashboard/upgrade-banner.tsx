import {
  ArrowRight,
  Clock,
  Crown,
  FileText,
  Lock,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatInrPaise, PLANS } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

type Feature = {
  icon: typeof Crown;
  label: string;
  sub: string;
};

const PRO_FEATURES: Feature[] = [
  { icon: Zap, label: "Unlimited conversions", sub: "No monthly cap" },
  { icon: FileText, label: "Up to 750 pages / site", sub: "Deep docs" },
  { icon: Lock, label: "Private projects", sub: "Hide from public" },
  { icon: Clock, label: "Auto re-crawl 24h", sub: "Always fresh" },
  { icon: Users, label: "Workflow AI + playground", sub: "Test tools live" },
];

export function UpgradeBanner({
  conversionsUsed,
  conversionLimit,
}: {
  conversionsUsed: number;
  conversionLimit: number;
}) {
  const percentUsed = Math.min(
    100,
    Math.round((conversionsUsed / Math.max(1, conversionLimit)) * 100)
  );
  const isOverLimit = conversionsUsed >= conversionLimit;
  const isNearLimit = percentUsed >= 80;

  return (
    <section className="rounded-2xl border border-border/50 bg-card/40 p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Crown className="size-3.5" />
            </span>
            <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Current plan · Free
            </span>
            {isOverLimit ? (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] text-amber-700 uppercase tracking-wider dark:text-amber-300">
                Limit reached
              </span>
            ) : null}
          </div>

          <h2 className="mt-3 font-display font-semibold text-xl tracking-tight sm:text-2xl">
            {isOverLimit
              ? "You've hit your Free monthly limit."
              : "You're on Free."}
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {isOverLimit
              ? `${conversionsUsed} / ${conversionLimit} conversions used this month. Upgrade to Pro for unlimited conversions and bigger crawls.`
              : `${conversionLimit} conversions / month and 50 pages per site. Pro lifts both caps, adds private projects, auto re-crawl, and the live MCP playground.`}
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PRO_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-background/40 p-2.5"
                  key={feat.label}
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-3" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-xs leading-tight">
                      {feat.label}
                    </p>
                    <p className="mt-0.5 text-muted-foreground text-[11px] leading-tight">
                      {feat.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                Conversions this month
              </p>
              <p
                className={cn(
                  "font-mono text-xs",
                  isOverLimit
                    ? "text-amber-700 dark:text-amber-300"
                    : isNearLimit
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-foreground/80"
                )}
              >
                {conversionsUsed} / {conversionLimit} · {percentUsed}%
              </p>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  isOverLimit
                    ? "bg-amber-500/80"
                    : isNearLimit
                      ? "bg-amber-500/70"
                      : "bg-foreground/60"
                )}
                style={{ width: `${Math.max(2, percentUsed)}%` }}
              />
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-3 lg:w-[220px] lg:items-stretch">
          <div className="rounded-xl border border-border/50 bg-background/40 p-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Offer · Pro plan
            </p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="font-display font-semibold text-2xl">
                {formatInrPaise(PLANS.pro.prices.monthly)}
              </span>
              <span className="text-muted-foreground text-xs">/ mo</span>
            </p>
            <p className="text-muted-foreground text-[11px]">
              One-time Razorpay payment · activates instantly
            </p>
          </div>

          <Button
            asChild
            className="w-full bg-foreground text-background hover:bg-foreground/90"
            size="sm"
          >
            <Link href="/pricing">
              Upgrade to Pro
              <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
          <Link
            className="text-center text-muted-foreground text-xs hover:text-foreground"
            href="/pricing"
          >
            Compare all plans
          </Link>
        </aside>
      </div>
    </section>
  );
}
