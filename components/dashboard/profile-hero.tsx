import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  Crown,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isPlanId, PLANS } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

type Plan = {
  planId: string;
  billingCycle: string | null;
  status: string | null;
  currentPeriodEnd: Date | null;
  entitlements: {
    mcpConversionsPerMonth: number;
    maxPagesPerSite: number;
    privateProjects: boolean;
    teammates: number;
  };
};

/**
 * Deterministic gradient seed from email so the avatar is consistent.
 */
const PALETTES = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-purple-500",
] as const;

function gradientFor(seed: string): string {
  let hash = 0;
  for (const ch of seed) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return PALETTES[hash % PALETTES.length] ?? PALETTES[0];
}

function initialsFor(email: string, name?: string | null): string {
  const fallback = email.charAt(0).toUpperCase() || "?";
  if (name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const second = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
    const combined = `${first}${second}`.toUpperCase();
    return combined || fallback;
  }
  return fallback;
}

function planLabel(planId: string): string {
  if (planId === "free") {
    return "Free";
  }
  return planId.charAt(0).toUpperCase() + planId.slice(1);
}

function planPriceLabel(planId: string, cycle: string | null): string | null {
  if (!isPlanId(planId)) {
    return null;
  }
  const cfg = PLANS[planId];
  const c =
    cycle === "yearly"
      ? "yearly"
      : cycle === "biannual"
        ? "biannual"
        : "monthly";
  const cents = cfg.prices[c];
  const dollars = (cents / 100).toFixed(2);
  const suffix = c === "yearly" ? "/year" : c === "biannual" ? "/6 mo" : "/mo";
  return `$${dollars}${suffix}`;
}

function statusTone(status: string | null): {
  label: string;
  className: string;
} {
  if (!status) {
    return { label: "Inactive", className: "bg-muted text-muted-foreground" };
  }
  if (status === "active" || status === "trialing") {
    return {
      label: status === "trialing" ? "Trial" : "Active",
      className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    };
  }
  if (status === "past_due") {
    return {
      label: "Past due",
      className: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    };
  }
  if (status === "canceled") {
    return {
      label: "Canceled",
      className: "bg-red-500/15 text-red-700 dark:text-red-300",
    };
  }
  return {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
}

export function ProfileHero({
  email,
  name,
  memberSince,
  plan,
  conversionsUsed,
  toolsGenerated,
}: {
  email: string;
  name?: string | null;
  memberSince: Date;
  plan: Plan;
  conversionsUsed: number;
  toolsGenerated: number;
}) {
  const limit = plan.entitlements.mcpConversionsPerMonth;
  const isUnlimited = limit < 0;
  const pct = isUnlimited
    ? 0
    : Math.min(100, Math.round((conversionsUsed / Math.max(1, limit)) * 100));
  const status = statusTone(plan.status);
  const gradient = gradientFor(email);
  const isPaid = plan.planId !== "free";
  const priceLabel = isPaid
    ? planPriceLabel(plan.planId, plan.billingCycle)
    : null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-6 sm:p-8">
      <div
        aria-hidden="true"
        className={cn(
          "-top-32 -right-32 pointer-events-none absolute size-72 rounded-full bg-gradient-to-br opacity-[0.06] blur-3xl dark:opacity-10",
          gradient
        )}
      />

      <div className="relative grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-display font-semibold text-2xl text-white shadow-lg",
              gradient
            )}
          >
            {initialsFor(email, name)}
          </div>
          <div className="min-w-0">
            <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
              Profile
            </p>
            <h1 className="mt-0.5 truncate font-display font-bold text-2xl tracking-tight sm:text-3xl">
              {name ?? email.split("@")[0]}
            </h1>
            <p className="mt-1 flex items-center gap-2 truncate text-muted-foreground text-sm">
              <span className="truncate font-mono">{email}</span>
              <BadgeCheck
                aria-label="Verified email"
                className="size-3.5 shrink-0 text-violet-700 dark:text-violet-300"
              />
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
          <Stat
            icon={Crown}
            label="Plan"
            value={
              <div className="flex flex-col gap-1">
                <Badge
                  className={cn(
                    "w-fit px-2 py-0.5 text-xs",
                    isPaid
                      ? "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                      : "bg-muted text-muted-foreground"
                  )}
                  variant="outline"
                >
                  {planLabel(plan.planId)}
                </Badge>
                {priceLabel ? (
                  <span className="font-mono text-[11px] text-foreground/80">
                    {priceLabel}
                  </span>
                ) : null}
              </div>
            }
          />
          <Stat
            icon={ShieldCheck}
            label="Status"
            value={
              <Badge
                className={cn("px-2 py-0.5 text-xs", status.className)}
                variant="outline"
              >
                {status.label}
              </Badge>
            }
          />
          <Stat
            icon={CalendarDays}
            label={isPaid ? "Renews" : "Member since"}
            value={
              <span className="font-medium text-sm">
                {isPaid && plan.currentPeriodEnd
                  ? new Date(plan.currentPeriodEnd).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric", year: "numeric" }
                    )
                  : memberSince.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
              </span>
            }
          />
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-col">
          {isPaid ? (
            <Button
              asChild
              className="lg:w-44"
              size="sm"
              type="button"
              variant="default"
            >
              <Link href="/dashboard/settings">
                <CreditCard className="mr-1 size-3.5" />
                Manage billing
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="lg:w-44"
              size="sm"
              type="button"
              variant="default"
            >
              <Link href="/pricing">
                <Sparkles className="mr-1 size-3.5" />
                Upgrade plan
              </Link>
            </Button>
          )}
          <Button
            asChild
            className="lg:w-44"
            size="sm"
            type="button"
            variant="outline"
          >
            <Link href="/dashboard/usage">View usage</Link>
          </Button>
        </div>
      </div>

      <div className="relative mt-6 grid gap-4 border-border/40 border-t pt-6 sm:grid-cols-3">
        <UsageMeter
          billingCycle={plan.billingCycle}
          isUnlimited={isUnlimited}
          limit={limit}
          pct={pct}
          used={conversionsUsed}
        />
        <MetricChip
          label="Pages / site"
          sub="Crawl cap per project"
          value={String(plan.entitlements.maxPagesPerSite)}
        />
        <MetricChip
          label="Tools generated"
          sub="All-time MCP tools"
          value={String(toolsGenerated)}
        />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: typeof Crown;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/40 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <Icon className="size-3.5" />
        <span className="font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-1.5">{value}</div>
    </div>
  );
}

function UsageMeter({
  used,
  limit,
  pct,
  isUnlimited,
  billingCycle,
}: {
  used: number;
  limit: number;
  pct: number;
  isUnlimited: boolean;
  billingCycle: string | null;
}) {
  const cycleLabel = billingCycle ? ` · ${billingCycle}` : "";
  const overage = !isUnlimited && pct >= 80;
  const tone = overage ? "bg-amber-500" : "bg-violet-500";
  return (
    <div className="rounded-xl border border-border/40 bg-background/40 p-3 sm:col-span-1">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
          Conversions this month
        </p>
        <p className="font-semibold text-sm">
          {isUnlimited ? "Unlimited" : `${used} / ${limit}`}
        </p>
      </div>
      {isUnlimited ? (
        <p className="mt-2 text-muted-foreground text-xs">
          No monthly cap on this plan{cycleLabel}.
        </p>
      ) : (
        <>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full transition-all duration-300", tone)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-muted-foreground text-xs">
            {pct}% used{cycleLabel}
            {overage ? " — close to limit." : "."}
          </p>
        </>
      )}
    </div>
  );
}

function MetricChip({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/40 p-3">
      <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-1 font-display font-semibold text-xl">{value}</p>
      <p className="mt-0.5 text-muted-foreground text-xs">{sub}</p>
    </div>
  );
}
