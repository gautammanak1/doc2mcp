import {
  ArrowRight,
  Check,
  Clock,
  Crown,
  FileText,
  Lock,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Feature = {
  icon: typeof Crown;
  label: string;
  sub: string;
};

const PRO_FEATURES: Feature[] = [
  {
    icon: Zap,
    label: "Unlimited conversions",
    sub: "No monthly cap",
  },
  {
    icon: FileText,
    label: "500+ pages per site",
    sub: "Deep documentation",
  },
  {
    icon: Lock,
    label: "Private projects",
    sub: "Hide from public listing",
  },
  {
    icon: Clock,
    label: "Auto re-crawl every 24h",
    sub: "Always fresh",
  },
  {
    icon: Users,
    label: "Team workspace ready",
    sub: "Invite teammates",
  },
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
  const isNearLimit = percentUsed >= 80;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-background p-6 sm:p-8">
      <div
        aria-hidden="true"
        className="-top-32 -right-32 pointer-events-none absolute size-72 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-20 blur-3xl"
      />

      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
              <Crown className="size-4" />
            </span>
            <p className="font-mono text-violet-300 text-xs uppercase tracking-wider">
              You&apos;re on the Free plan
            </p>
          </div>
          <h2 className="mt-3 font-display font-bold text-2xl tracking-tight sm:text-3xl">
            Unlock Pro and ship without limits.
          </h2>
          <p className="mt-1.5 text-muted-foreground text-sm">
            {isNearLimit
              ? `You've used ${percentUsed}% of your monthly conversions. Upgrade now to keep building without hitting the cap.`
              : `Free covers ${conversionLimit} conversions / month and ${80} pages per site. Pro lifts both caps and adds private projects + auto re-crawl.`}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRO_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  className="flex items-start gap-2.5 rounded-xl border border-border/40 bg-background/40 p-3"
                  key={feat.label}
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm leading-tight">
                      {feat.label}
                    </p>
                    <p className="mt-0.5 text-muted-foreground text-xs leading-tight">
                      {feat.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {isNearLimit ? (
            <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-amber-200 text-xs">
                  {conversionsUsed} / {conversionLimit} conversions used this
                  month
                </p>
                <p className="font-mono font-semibold text-amber-200 text-xs">
                  {percentUsed}%
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-900/40">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="rounded-2xl border border-violet-500/30 bg-background/60 p-4 text-center lg:min-w-[200px]">
            <p className="font-mono text-muted-foreground text-[10px] uppercase tracking-wider">
              Pro plan
            </p>
            <p className="mt-1 flex items-baseline justify-center gap-1">
              <span className="font-display font-bold text-3xl">$20</span>
              <span className="text-muted-foreground text-xs">/ month</span>
            </p>
            <p className="mt-1 text-muted-foreground text-xs">Cancel anytime</p>
          </div>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 lg:w-auto"
            size="lg"
          >
            <Link href="/pricing">
              Upgrade to Pro
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Link
            className="text-center text-muted-foreground text-xs hover:text-foreground"
            href="/pricing"
          >
            Compare all plans
          </Link>
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap items-center gap-3 border-border/30 border-t pt-4 text-muted-foreground text-xs">
        <span className="flex items-center gap-1">
          <Check className="size-3 text-emerald-400" /> No credit card to start
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Check className="size-3 text-emerald-400" /> Cancel anytime
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Check className="size-3 text-emerald-400" /> Money-back guarantee
        </span>
      </div>
    </section>
  );
}
