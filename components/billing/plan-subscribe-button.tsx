"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { BillingCycle, PlanId } from "@/lib/billing/plans";
import { useSupabaseAuth } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

type PlanSubscribeButtonProps = {
  planId: PlanId;
  cycle: BillingCycle;
  label: string;
  highlight?: boolean;
};

export function PlanSubscribeButton({
  planId,
  cycle,
  label,
  highlight,
}: PlanSubscribeButtonProps) {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const [pending, setPending] = useState(false);

  const handleSubscribe = async () => {
    if (loading) {
      return;
    }

    if (!user) {
      router.push(`/login?redirectUrl=${encodeURIComponent("/pricing")}`);
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, cycle }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Could not start checkout");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      className={cn(
        "w-full",
        highlight ? "bg-violet-500 text-white hover:bg-violet-500/90" : ""
      )}
      disabled={pending || loading}
      onClick={handleSubscribe}
      size="lg"
      type="button"
      variant={highlight ? "default" : "outline"}
    >
      {pending ? "Redirecting…" : label}
    </Button>
  );
}
