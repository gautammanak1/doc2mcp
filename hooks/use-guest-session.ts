"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSupabaseAuth } from "@/lib/supabase/auth";

export function useGuestSession(redirectUrl = "/chat") {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const redirected = useRef(false);

  useEffect(() => {
    if (loading || user) {
      return;
    }

    if (redirected.current) {
      return;
    }

    redirected.current = true;
    const loginPath = `/login?redirectUrl=${encodeURIComponent(redirectUrl)}`;
    router.replace(loginPath);
  }, [loading, user, redirectUrl, router]);

  return { user, loading };
}
