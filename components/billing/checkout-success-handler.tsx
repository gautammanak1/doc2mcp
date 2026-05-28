"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

type SyncResponse = {
  ok?: boolean;
  synced?: number;
  planId?: string;
  status?: string;
  reason?: string;
  message?: string;
  error?: string;
};

/**
 * Drop this anywhere inside an authenticated page that Stripe might redirect
 * to. When it sees `?checkout=success` it pulls the latest subscription state
 * from Stripe (covering the case where the webhook didn't reach us) and then
 * cleans the query string + refreshes server data.
 */
export function CheckoutSuccessHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const ranRef = useRef(false);

  const checkout = params.get("checkout");

  useEffect(() => {
    if (checkout !== "success" || ranRef.current) {
      return;
    }
    ranRef.current = true;

    const toastId = toast.loading("Finalizing your subscription…");

    (async () => {
      try {
        const res = await fetch("/api/stripe/sync", { method: "POST" });
        const data = (await res.json().catch(() => ({}))) as SyncResponse;

        if (!res.ok) {
          toast.error(
            data.message ?? data.error ?? "Could not sync subscription",
            { id: toastId, duration: 10_000 }
          );
        } else if (data.ok && data.planId && data.planId !== "free") {
          toast.success(`You're on the ${formatPlan(data.planId)} plan!`, {
            id: toastId,
            description: "Unlimited features unlocked. Welcome aboard.",
            duration: 8000,
          });
        } else if (data.reason === "no_subscriptions") {
          toast.message("Payment confirmed", {
            id: toastId,
            description:
              "Stripe hasn't activated the subscription yet. Try Refresh from Settings in a minute.",
            duration: 10_000,
          });
        } else {
          toast.message("Subscription pending", {
            id: toastId,
            description:
              data.message ??
              "We're waiting on Stripe to finalize. Refresh in a minute.",
            duration: 10_000,
          });
        }
      } catch {
        toast.error("Could not reach Stripe to confirm your subscription", {
          id: toastId,
        });
      } finally {
        const url = new URL(window.location.href);
        url.searchParams.delete("checkout");
        window.history.replaceState(null, "", url.toString());
        router.refresh();
      }
    })();
  }, [checkout, router]);

  return null;
}

function formatPlan(planId: string): string {
  return planId.charAt(0).toUpperCase() + planId.slice(1);
}
