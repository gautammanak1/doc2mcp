"use client";

import {
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  GitBranch,
  type LucideIcon,
  Network,
  RefreshCw,
  Rocket,
} from "lucide-react";

type Outcome = {
  id: string;
  title: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
};

const OUTCOMES: Outcome[] = [
  {
    id: "halluc",
    title: "Reduce hallucinated code",
    detail:
      "Agents respond from your real docs — not stale training data — so generated code actually compiles and ships.",
    icon: Brain,
    accent: "from-[#4285f4]/15 to-[#8ab4f8]/0",
  },
  {
    id: "accuracy",
    title: "Improve AI coding accuracy",
    detail:
      "Schema-aware retrieval narrows answers to the right endpoint, the right version, the right example.",
    icon: CheckCircle2,
    accent: "from-[#4285f4]/15 to-[#8ab4f8]/0",
  },
  {
    id: "manual",
    title: "Avoid manual MCP development",
    detail:
      "Stop hand-writing tool wrappers per product. Doc2MCP generates them from documentation, automatically.",
    icon: GitBranch,
    accent: "from-[#4285f4]/15 to-[#8ab4f8]/0",
  },
  {
    id: "updates",
    title: "Keep documentation updated",
    detail:
      "Live sync keeps the MCP server tracking your source — without redeploys, manual diffs, or token rotation.",
    icon: RefreshCw,
    accent: "from-[#4285f4]/15 to-[#8ab4f8]/0",
  },
  {
    id: "context",
    title: "Give AI agents structured context",
    detail:
      "Replace prompt stuffing with structured, retrievable, AI-optimized context — usable across every MCP client.",
    icon: Bot,
    accent: "from-[#4285f4]/15 to-[#8ab4f8]/0",
  },
  {
    id: "ship",
    title: "Ship integrations faster",
    detail:
      "From “read docs” to “write integration” in minutes — across Cursor, Claude, Windsurf, OpenAI Agents.",
    icon: Rocket,
    accent: "from-[#4285f4]/15 to-[#8ab4f8]/0",
  },
  {
    id: "scale",
    title: "Scale internal knowledge systems",
    detail:
      "Convert internal runbooks, ADRs, RFCs, and product docs into a queryable knowledge layer for your agents.",
    icon: Network,
    accent: "from-[#4285f4]/15 to-[#8ab4f8]/0",
  },
  {
    id: "time",
    title: "Reclaim engineering hours",
    detail:
      "Stop pasting docs into prompts and debugging hallucinations — your team’s time goes back to product.",
    icon: Clock,
    accent: "from-[#4285f4]/15 to-[#8ab4f8]/0",
  },
];

export function WhyTeamsSection() {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24 lg:py-32"
      id="why-teams"
    >
      <div
        aria-hidden="true"
        className="-translate-x-1/2 pointer-events-none absolute top-10 left-1/2 size-[520px] rounded-full bg-[#4285f4]/8 blur-[140px]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-3 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
            <span className="h-px w-8 bg-foreground/30" />
            Outcomes
            <span className="h-px w-8 bg-foreground/30" />
          </span>
          <h2 className="mt-6 font-display text-3xl tracking-tight sm:text-5xl lg:text-6xl">
            Why teams use{" "}
            <span className="text-[#4285f4] dark:text-[#8ab4f8] font-semibold">
              Doc2MCP
            </span>
          </h2>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed sm:text-lg">
            The compound effect of giving every agent — internal or customer-
            facing — structured, current, AI-ready documentation.
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {OUTCOMES.map((o) => {
            const Icon = o.icon;
            return (
              <li
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4285f4]/50 dark:hover:border-[#8ab4f8]/50"
                key={o.id}
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${o.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-background/60 text-[#4285f4] dark:text-[#8ab4f8]">
                  <Icon className="size-4" />
                </span>
                <h3 className="mt-4 font-display font-semibold text-foreground text-base">
                  {o.title}
                </h3>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  {o.detail}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
