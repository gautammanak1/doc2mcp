"use client";

import {
  Code2,
  GitBranch,
  Layers,
  type LucideIcon,
  Quote,
  Sparkles,
  Users,
} from "lucide-react";

type Pill = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const PILLS: Pill[] = [
  { id: "ai", label: "Built for AI-native developers", icon: Sparkles },
  { id: "agents", label: "Designed for agent workflows", icon: Code2 },
  { id: "teams", label: "Helping teams make docs AI-accessible", icon: Users },
];

type Trust = {
  id: string;
  metric: string;
  label: string;
  icon: LucideIcon;
};

const TRUST: Trust[] = [
  {
    id: "stack",
    metric: "5 +",
    label: "MCP clients supported",
    icon: Layers,
  },
  {
    id: "registry",
    metric: "v0.1",
    label: "Live in the MCP Registry",
    icon: GitBranch,
  },
  {
    id: "asi1",
    metric: "ASI1",
    label: "AI engine under the hood",
    icon: Sparkles,
  },
];

type PoweredBy = {
  id: string;
  name: string;
  detail: string;
  url: string;
};

const POWERED_BY: PoweredBy[] = [
  {
    id: "asi1",
    name: "ASI1",
    detail: "LLM for crawling, compression & answers",
    url: "https://asi1.ai",
  },
  {
    id: "fetchai",
    name: "Fetch.ai",
    detail: "Agentic AI infrastructure",
    url: "https://fetch.ai",
  },
];

export function SocialProofSection() {
  return (
    <section
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24"
      id="social-proof"
    >
      <div
        aria-hidden="true"
        className="-translate-x-1/2 pointer-events-none absolute top-0 left-1/2 size-[420px] rounded-full bg-violet-500/10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-3 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
            <span className="h-px w-8 bg-foreground/30" />
            Trust
            <span className="h-px w-8 bg-foreground/30" />
          </span>
          <h2 className="mt-5 font-display text-2xl tracking-tight sm:text-4xl">
            Built for the people building the agentic web.
          </h2>
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {PILLS.map((p) => {
            const Icon = p.icon;
            return (
              <li
                className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 backdrop-blur-xl transition-all hover:border-violet-500/40 hover:bg-violet-500/5"
                key={p.id}
              >
                <Icon
                  aria-hidden="true"
                  className="size-3.5 text-violet-500 dark:text-violet-300"
                />
                <span className="font-display font-medium text-foreground/85 text-sm">
                  {p.label}
                </span>
              </li>
            );
          })}
        </ul>

        <figure className="mx-auto mt-12 max-w-2xl rounded-3xl border border-border/60 bg-card/40 p-7 backdrop-blur-xl">
          <Quote
            aria-hidden="true"
            className="size-5 text-violet-500 dark:text-violet-300"
          />
          <blockquote className="mt-3 font-display text-foreground text-lg leading-relaxed sm:text-xl">
            We stopped pasting docs into prompts. Our agents finally know what
            our APIs actually do — across every editor in our stack.
          </blockquote>
          <figcaption className="mt-4 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
            — Early Doc2MCP customer · AI infra team
          </figcaption>
        </figure>

        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {TRUST.map((t) => {
            const Icon = t.icon;
            return (
              <li
                className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/30 px-4 py-3.5 backdrop-blur-xl"
                key={t.id}
              >
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-background/60">
                  <Icon
                    aria-hidden="true"
                    className="size-4 text-foreground/80"
                  />
                </span>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-foreground text-base tracking-tight">
                    {t.metric}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
                    {t.label}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            Powered by
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {POWERED_BY.map((p) => (
              <a
                className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 backdrop-blur-xl transition-all hover:border-violet-500/40 hover:bg-violet-500/5"
                href={p.url}
                key={p.id}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Sparkles
                  aria-hidden="true"
                  className="size-3.5 text-violet-500 dark:text-violet-300"
                />
                <span className="font-display font-semibold text-foreground text-sm">
                  {p.name}
                </span>
                <span className="hidden text-muted-foreground text-xs sm:inline">
                  {p.detail}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
