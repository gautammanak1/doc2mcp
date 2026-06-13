"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabasePublicConfigured } from "@/lib/supabase/env";

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasSupabaseConfig = isSupabasePublicConfigured();
  const supabase = useMemo(
    () => (hasSupabaseConfig ? createClient() : null),
    [hasSupabaseConfig]
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
    }
    setUser(null);
    setLoading(false);
  }, [supabase]);

  return {
    user,
    loading,
    signOut,
    supabase,
  };
}
