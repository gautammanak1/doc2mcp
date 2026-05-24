import { ArrowUpRight, BarChart3, Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserPlan } from "@/lib/billing/entitlements";
import {
  countUserConversionsThisMonth,
  getPlatformProjectsByUserId,
} from "@/lib/db/queries";
import { cn } from "@/lib/utils";

function buildDailyBuckets(
  projects: Array<{ createdAt: Date }>,
  days = 14
): { label: string; iso: string; count: number }[] {
  const now = new Date();
  const buckets: { label: string; iso: string; count: number }[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() - offset);
    buckets.push({
      label: day.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      iso: day.toISOString().slice(0, 10),
      count: 0,
    });
  }
  for (const project of projects) {
    const iso = new Date(project.createdAt).toISOString().slice(0, 10);
    const bucket = buckets.find((b) => b.iso === iso);
    if (bucket) {
      bucket.count += 1;
    }
  }
  return buckets;
}

export default async function DashboardUsagePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectUrl=/dashboard/usage");
  }

  const [projects, plan, usedThisMonth] = await Promise.all([
    getPlatformProjectsByUserId({ userId: session.user.id }),
    getUserPlan(session.user.id),
    countUserConversionsThisMonth(session.user.id),
  ]);

  const buckets = buildDailyBuckets(projects, 14);
  const maxCount = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const limit = plan.entitlements.mcpConversionsPerMonth;
  const remaining =
    limit < 0 ? Number.POSITIVE_INFINITY : Math.max(0, limit - usedThisMonth);
  const percentUsed =
    limit < 0
      ? 0
      : Math.min(100, Math.round((usedThisMonth / Math.max(1, limit)) * 100));

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
          Usage
        </p>
        <h1 className="mt-1 font-display font-bold text-3xl tracking-tight">
          Usage & quotas
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Conversions used this month, plan limits, and a 14-day activity
          breakdown.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>This month</CardTitle>
            <CardDescription>
              {limit < 0
                ? "Unlimited conversions on your current plan."
                : `${usedThisMonth} of ${limit} conversions used`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  percentUsed >= 90
                    ? "bg-red-500"
                    : percentUsed >= 70
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                )}
                style={{ width: `${limit < 0 ? 12 : percentUsed}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {limit < 0
                  ? "Soft fair-use cap applies"
                  : `${remaining} remaining`}
              </span>
              <Badge variant={percentUsed >= 90 ? "destructive" : "secondary"}>
                {limit < 0 ? "Unlimited" : `${percentUsed}%`}
              </Badge>
            </div>
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <PlanFact
                label="Plan"
                value={plan.planId === "free" ? "Free" : plan.planId}
              />
              <PlanFact
                label="Pages per site"
                value={String(plan.entitlements.maxPagesPerSite)}
              />
              <PlanFact
                label="Re-crawl"
                value={
                  plan.entitlements.recrawlHours
                    ? `Every ${plan.entitlements.recrawlHours}h`
                    : "Manual"
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need more?</CardTitle>
            <CardDescription>
              Upgrade for unlimited conversions and private projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full" type="button">
              <Link href="/pricing">
                <Zap className="mr-1 size-4" />
                Upgrade plan
              </Link>
            </Button>
            <Button
              asChild
              className="w-full justify-between"
              type="button"
              variant="outline"
            >
              <Link href="/dashboard/settings">
                Billing portal
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4 text-muted-foreground" />
              Conversions · last 14 days
            </CardTitle>
            <CardDescription>
              Daily MCP conversions for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {buckets.map((bucket) => (
                <div
                  className="flex flex-1 flex-col items-center gap-1"
                  key={bucket.iso}
                  title={`${bucket.label} · ${bucket.count} conversion${bucket.count === 1 ? "" : "s"}`}
                >
                  <div className="flex h-full w-full items-end">
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-all",
                        bucket.count > 0 ? "bg-violet-500/70" : "bg-muted"
                      )}
                      style={{
                        height: `${Math.max(6, (bucket.count / maxCount) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {bucket.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function PlanFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
      <p className="font-mono text-muted-foreground text-[10px] uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-1 font-semibold capitalize">{value}</p>
    </div>
  );
}
