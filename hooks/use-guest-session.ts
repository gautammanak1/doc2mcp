"use client";

import { useEffect, useRef } from "react";
import { useSupabaseAuth } from "@/lib/supabase/auth";

export function useGuestSession(redirectPath = "/chat") {
  const { user, loading } = useSupabaseAuth();
  const started = useRef(false);

  useEffect(() => {
    if (!loading && !user && !started.current) {
      started.current = true;
      window.location.href = redirectPath;
    }
  }, [loading, user, redirectPath]);
}
