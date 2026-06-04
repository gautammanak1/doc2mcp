"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import type { PlatformProject } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/client";
import { isSupabasePublicConfigured } from "@/lib/supabase/env";

async function fetchProject(id: string): Promise<PlatformProject | null> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as { project?: PlatformProject };
  return data.project ?? null;
}

/**
 * Combines:
 *   1. Initial server-rendered project state (no flash).
 *   2. SWR polling fallback every 2.5s when the project is still processing.
 *   3. Supabase Realtime UPDATE subscription on the PlatformProject row.
 *
 * Polling acts as a backup if Realtime is not enabled on the table; once
 * realtime publication is configured in Supabase, updates arrive within ~1s.
 */
export function useRealtimeProject(initial: PlatformProject) {
  const [project, setProject] = useState<PlatformProject>(initial);
  const isProcessing = !(
    project.status === "ready" || project.status === "error"
  );

  const { data: polled } = useSWR(
    isProcessing ? ["project", initial.id] : null,
    () => fetchProject(initial.id),
    {
      refreshInterval: 2500,
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (polled) {
      setProject(polled);
    }
  }, [polled]);

  useEffect(() => {
    if (!isSupabasePublicConfigured()) {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`project:${initial.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "PlatformProject",
          filter: `id=eq.${initial.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProject(payload.new as PlatformProject);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initial.id]);

  return { project, isProcessing };
}
