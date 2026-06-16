"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSupabaseAuth } from "@/lib/supabase/auth";

/**
 * Ensures there is always a session on the chat route.
 *
 * Visitors who are not signed in get a server-issued guest session so they can
 * chat immediately (capped at the guest message limit). MCP generation and
 * unlimited chat still require a real login.
 */
export function useGuestSession(redirectUrl = "/chat") {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const attempted = useRef(false);

  useEffect(() => {
    if (loading || user || attempted.current) {
      return;
    }

    attempted.current = true;

    const redirectToLogin = () => {
      router.replace(`/login?redirectUrl=${encodeURIComponent(redirectUrl)}`);
    };

    fetch("/api/auth/guest", { method: "POST" })
      .then((response) => {
        if (!response.ok) {
          redirectToLogin();
          return;
        }
        router.refresh();
      })
      .catch(() => {
        redirectToLogin();
      });
  }, [loading, user, redirectUrl, router]);

  return { user, loading };
}
