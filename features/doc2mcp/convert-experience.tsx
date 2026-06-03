"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AnimatedBackground } from "@/components/doc2mcp/animated-background";
import { PipelineProgress } from "@/components/doc2mcp/pipeline-progress";
import {
  ResultDashboard,
  StatusBadge,
} from "@/components/doc2mcp/result-dashboard";
import { TerminalLog } from "@/components/doc2mcp/terminal-log";
import { Button } from "@/components/ui/button";
import type { PlatformProject } from "@/lib/db/schema";
import type { ProcessingLog, ProjectArtifacts } from "@/types/platform";

const PIPELINE_STEPS = [
  "crawl",
  "auth",
  "extract",
  "workflows",
  "compress",
  "mcp",
  "config",
] as const;

function stepFromStatus(status: string): number {
  switch (status) {
    case "pending":
      return 0;
    case "crawling":
      return 1;
    case "analyzing":
      return 3;
    case "generating":
      return 5;
    case "ready":
      return 7;
    case "error":
      return -1;
    default:
      return 0;
  }
}

function formatCreated(value: Date | string | null | undefined): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ConvertExperience({
  initialProject,
}: {
  initialProject: PlatformProject;
}) {
  const [project, setProject] = useState(initialProject);
  const artifacts = project.artifacts as ProjectArtifacts | null;
  const logs = (project.logs as ProcessingLog[]) ?? [];
  const isProcessing = !["ready", "error"].includes(project.status);
  const currentStep = stepFromStatus(project.status);

  useEffect(() => {
    if (!isProcessing) {
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let delay = 2000;
    let attempts = 0;
    const MAX_ATTEMPTS = 150;

    const poll = async () => {
      if (cancelled) {
        return;
      }
      attempts += 1;

      try {
        const res = await fetch(`/api/projects/${project.id}`);
        if (res.ok) {
          const data = await res.json();
          if (cancelled) {
            return;
          }
          setProject(data.project);
          if (["ready", "error"].includes(data.project.status)) {
            return;
          }
        }
      } catch {
        // Transient network error — keep polling with backoff.
      }

      if (cancelled || attempts >= MAX_ATTEMPTS) {
        return;
      }
      // Back off gradually so a slow pipeline doesn't hammer the API,
      // capping at 10s to keep the UI reasonably fresh.
      delay = Math.min(Math.round(delay * 1.25), 10_000);
      timer = setTimeout(poll, delay);
    };

    timer = setTimeout(poll, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isProcessing, project.id]);

  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Project link copied");
  };

  return (
    <div className="relative text-foreground">
      <AnimatedBackground />

      {/* Project context bar — sits beneath the global site navigation. */}
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 mt-20 border-white/5 border-b bg-black/40 backdrop-blur-xl sm:mt-24"
        initial={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-sm">{project.name}</p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">
                {project.sourceUrl}
              </p>
            </div>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex items-center gap-1.5">
            {formatCreated(project.createdAt) ? (
              <span className="hidden font-mono text-[11px] text-muted-foreground md:inline">
                {formatCreated(project.createdAt)}
              </span>
            ) : null}
            <Button onClick={share} size="sm" type="button" variant="outline">
              <Share2 className="mr-1 size-3.5" />
              Share
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/chat">
                <ArrowLeft className="mr-1 size-3.5" />
                New
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <main className="relative z-10 mx-auto max-w-6xl space-y-10 px-6 py-10">
        {isProcessing ? (
          <>
            <section>
              <p className="font-mono text-muted-foreground text-xs">source</p>
              <p className="mt-1 truncate font-mono text-sm">
                {project.sourceUrl}
              </p>
              <div className="mt-6">
                <PipelineProgress
                  currentStep={currentStep}
                  status={project.status}
                  steps={PIPELINE_STEPS}
                />
              </div>
            </section>

            <section className="glass-card neon-border rounded-2xl p-5">
              <p className="mb-3 font-mono text-muted-foreground text-xs">
                terminal
              </p>
              {logs.length > 0 ? (
                <TerminalLog
                  lines={logs.map((l) => `[${l.level}] ${l.message}`)}
                  streaming={isProcessing}
                />
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="size-4 animate-spin" />
                  Starting pipeline...
                </div>
              )}
            </section>
          </>
        ) : null}

        <AnimatePresence>
          {project.status === "ready" && artifacts ? (
            <ResultDashboard artifacts={artifacts} project={project} />
          ) : null}

          {project.status === "error" ? (
            <motion.div
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center"
              initial={{ opacity: 0 }}
            >
              <p className="text-red-300">
                Conversion failed. Try another URL.
              </p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/">Start over</Link>
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
