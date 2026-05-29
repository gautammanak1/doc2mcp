"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type {
  BillingCurrency,
  BillingCycle,
  PlanId,
} from "@/lib/billing/plans";
import { useSupabaseAuth } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

type CreateOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  plan: PlanId;
  cycle: BillingCycle;
  planName: string;
  userEmail: string | null;
  userName: string | null;
  error?: string;
};

type RazorpayHandlerArgs = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpayHandlerArgs) => void | Promise<void>;
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: "payment.failed",
    cb: (response: { error: { description?: string; reason?: string } }) => void
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (opts: RazorpayOptions) => RazorpayInstance;
  }
}

export function RazorpayCheckoutButton({
  planId,
  cycle,
  currency,
  label,
  highlight,
  successRedirect = "/dashboard?checkout=success",
}: {
  planId: PlanId;
  cycle: BillingCycle;
  currency: BillingCurrency;
  label: string;
  highlight?: boolean;
  successRedirect?: string;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseAuth();
  const [pending, setPending] = useState(false);

  const startCheckout = useCallback(async () => {
    if (authLoading) {
      return;
    }
    if (!user) {
      router.push(`/login?redirectUrl=${encodeURIComponent("/pricing")}`);
      return;
    }

    if (typeof window === "undefined" || !window.Razorpay) {
      toast.error("Payment script is still loading. Try again in a second.");
      return;
    }

    setPending(true);
    const loadingId = toast.loading("Setting up checkout…");

    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, cycle, currency }),
      });

      const data = (await res.json()) as CreateOrderResponse;
      if (!res.ok) {
        toast.error(data.error ?? "Could not start checkout", {
          id: loadingId,
        });
        return;
      }

      toast.dismiss(loadingId);

      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) {
        toast.error("Razorpay failed to load. Refresh and try again.");
        return;
      }

      const rzp = new RazorpayCtor({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "doc2mcp",
        description: `${data.planName} plan (${cycle})`,
        order_id: data.orderId,
        prefill: {
          name: data.userName ?? undefined,
          email: data.userEmail ?? undefined,
        },
        notes: { plan: planId, cycle, currency },
        theme: { color: "#7c3aed" },
        modal: {
          ondismiss: () => {
            toast.message("Checkout cancelled", {
              description: "You can pick a plan again any time.",
            });
          },
        },
        handler: async (response) => {
          const verifyToast = toast.loading("Confirming payment…");
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                plan: planId,
                cycle,
              }),
            });
            const verifyData = (await verifyRes.json().catch(() => ({}))) as {
              ok?: boolean;
              error?: string;
            };
            if (!(verifyRes.ok && verifyData.ok)) {
              toast.error(verifyData.error ?? "Payment verification failed", {
                id: verifyToast,
                duration: 10_000,
              });
              return;
            }
            toast.success("Plan activated — welcome aboard!", {
              id: verifyToast,
            });
            router.push(successRedirect);
            router.refresh();
          } catch {
            toast.error("Network error verifying payment", {
              id: verifyToast,
            });
          }
        },
      });

      rzp.on("payment.failed", (response) => {
        toast.error("Payment failed", {
          description:
            response.error.description ??
            response.error.reason ??
            "Please try a different card or method.",
          duration: 10_000,
        });
      });

      rzp.open();
    } catch {
      toast.error("Checkout failed. Please try again.", { id: loadingId });
    } finally {
      setPending(false);
    }
  }, [authLoading, user, router, planId, cycle, currency, successRedirect]);

  return (
    <>
      <Script src={CHECKOUT_SCRIPT_SRC} strategy="lazyOnload" />
      <Button
        className={cn(
          "w-full",
          highlight ? "bg-violet-500 text-white hover:bg-violet-500/90" : ""
        )}
        disabled={pending || authLoading}
        onClick={startCheckout}
        size="lg"
        type="button"
        variant={highlight ? "default" : "outline"}
      >
        {pending ? "Opening Razorpay…" : label}
      </Button>
    </>
  );
}
