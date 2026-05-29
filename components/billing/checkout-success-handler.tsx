"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Razorpay checkout already activates the plan inline via
 * /api/razorpay/verify-payment. This component is just the post-redirect
 * confirmation toast: when the dashboard mounts with ?checkout=success it
 * shows a friendly message and cleans the query string.
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

    toast.success("Payment received", {
      description: "Your plan is active. Welcome aboard.",
      duration: 6000,
    });

    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    window.history.replaceState(null, "", url.toString());
    router.refresh();
  }, [checkout, router]);

  return null;
}
