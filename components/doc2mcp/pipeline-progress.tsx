"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  crawl: "Crawl docs",
  extract: "Extract APIs",
  analyze: "ASI1 analyze",
  compress: "Compress tools",
  mcp: "Build MCP",
  config: "Cursor config",
};

export function PipelineProgress({
  steps,
  currentStep,
  status,
}: {
  steps: readonly string[];
  currentStep: number;
  status: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((step, i) => {
        const done = currentStep > i || status === "ready";
        const active =
          currentStep === i && status !== "ready" && status !== "error";
        const failed = status === "error" && currentStep === i;

        return (
          <motion.div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] transition-colors",
              done &&
                "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
              active && "border-violet-500/50 bg-violet-500/15 text-violet-300",
              !done &&
                !active &&
                !failed &&
                "border-white/10 text-muted-foreground",
              failed && "border-red-500/40 bg-red-500/10 text-red-400"
            )}
            key={step}
            layout
          >
            {done ? (
              <Check className="size-3" />
            ) : active ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <span className="size-3 rounded-full border border-current opacity-40" />
            )}
            {LABELS[step] ?? step}
          </motion.div>
        );
      })}
    </div>
  );
}
