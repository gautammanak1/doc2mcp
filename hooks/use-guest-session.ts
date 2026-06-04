"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSupabaseAuth } from "@/lib/supabase/auth";

/**
 * Ensures there is always a session on the chat route.
 *
 * Visitors who are not signed in get a Supabase **anonymous** session so they
 * can chat immediately (capped at the guest message limit). MCP generation and
 * unlimited chat still require a real login. If anonymous sign-in is
 * unavailable (e.g. disabled in the Supabase dashboard), we fall back to the
 * login redirect.
 */
export function useGuestSession(redirectUrl = "/chat") {
  const router = useRouter();
  const { user, loading, supabase } = useSupabaseAuth();
  const attempted = useRef(false);

  useEffect(() => {
    if (loading || user || attempted.current) {
      return;
    }

    attempted.current = true;

    const redirectToLogin = () => {
      router.replace(`/login?redirectUrl=${encodeURIComponent(redirectUrl)}`);
    };

    if (!supabase) {
      redirectToLogin();
      return;
    }

    supabase.auth
      .signInAnonymously()
      .then(({ error }) => {
        if (error) {
          redirectToLogin();
        }
        // On success, onAuthStateChange in useSupabaseAuth updates `user`.
      })
      .catch(() => {
        redirectToLogin();
      });
  }, [loading, user, redirectUrl, router, supabase]);

  return { user, loading };
}
