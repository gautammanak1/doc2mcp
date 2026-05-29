"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SuccessfulDialog from "@/components/shadcn-studio/blocks/dashboard-dialog-21/dialog-successful";

/**
 * Razorpay checkout already activates the plan inline via
 * /api/razorpay/verify-payment. This component is the post-redirect
 * confirmation: when the dashboard mounts with ?checkout=success it
 * opens a polished "Payment Successful" dialog and cleans the query string.
 */
export function CheckoutSuccessHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const ranRef = useRef(false);
  const [open, setOpen] = useState(false);

  const checkout = params.get("checkout");

  useEffect(() => {
    if (checkout !== "success" || ranRef.current) {
      return;
    }
    ranRef.current = true;
    setOpen(true);

    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    window.history.replaceState(null, "", url.toString());
    router.refresh();
  }, [checkout, router]);

  if (!open) {
    return null;
  }

  return (
    <SuccessfulDialog
      defaultOpen
      trigger={<span aria-hidden className="hidden" />}
    />
  );
}
