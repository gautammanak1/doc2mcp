import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getUserPlan } from "@/lib/billing/entitlements";

function DashboardFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <p className="font-mono text-muted-foreground text-xs">
        loading dashboard…
      </p>
    </div>
  );
}

async function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirectUrl=/dashboard");
  }

  if (session.user.type === "guest") {
    redirect("/login?redirectUrl=/dashboard");
  }

  const plan = await getUserPlan(session.user.id);
  const planLabel =
    plan.planId === "free"
      ? "Free"
      : `${plan.planId.charAt(0).toUpperCase()}${plan.planId.slice(1)}`;

  return (
    <DashboardShell planLabel={planLabel} userEmail={session.user.email ?? ""}>
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
