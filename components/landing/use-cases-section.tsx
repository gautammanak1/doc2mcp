"use client";

import {
  Building2,
  Cpu,
  GitFork,
  Layers,
  Lock,
  Network,
  Workflow,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type UseCase = {
  id: string;
  badge: string;
  title: string;
  body: string;
  bullets: string[];
  icon: typeof Cpu;
  accent: string;
};

const USE_CASES: UseCase[] = [
  {
    id: "api",
    badge: "For API Companies",
    title: "Turn API docs into AI-native integrations.",
    body: "Every API endpoint becomes a semantic tool your customers' agents can call directly — no SDK, no glue code, no support tickets.",
    bullets: [
      "OpenAPI, Swagger, and Postman collections",
      "Auto-generated auth + workflow primitives",
      "One MCP URL, distributed to every customer's IDE",
    ],
    icon: Network,
    accent: "from-sky-500/25 via-sky-500/10 to-transparent",
  },
  {
    id: "saas",
    badge: "For SaaS Platforms",
    title: "Let AI agents understand your product.",
    body: "Ship your docs as an MCP server alongside your dashboard. Cursor, Claude, and Windsurf can now answer questions about your product with first-party context.",
    bullets: [
      "Public docs + private knowledge bases",
      "Versioned per release, auto-resynced",
      "Reduce support load by ~30% with agentic Q&A",
    ],
    icon: Layers,
    accent: "from-violet-500/25 via-violet-500/10 to-transparent",
  },
  {
    id: "internal",
    badge: "For Internal Teams",
    title: "Convert internal docs into MCP infrastructure.",
    body: "Notion, Confluence, Markdown wikis — pipe them into a private MCP your engineers' agents can query without exposing data to third parties.",
    bullets: [
      "Self-hosted or single-tenant deployments",
      "SSO + role-based access control",
      "Audit logs for every agent query",
    ],
    icon: Building2,
    accent: "from-emerald-500/25 via-emerald-500/10 to-transparent",
  },
  {
    id: "oss",
    badge: "For Open Source",
    title: "Give coding agents accurate project context.",
    body: "Drop your GitHub docs URL. Every contributor's Cursor or Claude instantly understands your project's architecture, API surface, and conventions.",
    bullets: [
      "GitHub-native — works with raw markdown + READMEs",
      "Free tier for public projects",
      "Public MCP listing in the official Registry",
    ],
    icon: GitFork,
    accent: "from-fuchsia-500/25 via-fuchsia-500/10 to-transparent",
  },
];

const TRUST_ROW = [
  { icon: Lock, label: "SOC 2 ready architecture" },
  { icon: Cpu, label: "ASI1-native indexing" },
  { icon: Workflow, label: "Agent-shaped toolkits" },
  { icon: Zap, label: "< 60s URL → MCP" },
];

export function UseCasesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-28 lg:py-32"
      id="use-cases"
      ref={sectionRef}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[120px] dark:bg-violet-500/15" />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-12">
        <div className="mb-12 max-w-3xl sm:mb-16">
          <span className="inline-flex items-center gap-2 font-mono text-muted-foreground text-xs uppercase tracking-[0.18em] sm:text-sm">
            <span className="h-px w-8 bg-foreground/30" />
            Use cases
          </span>
          <h2
            className={cn(
              "mt-5 font-display text-3xl tracking-tight transition-all duration-700 sm:text-5xl lg:text-6xl",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
          >
            Infrastructure for every AI-native team.
          </h2>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-lg">
            From public APIs to private wikis — doc2mcp converts any
            documentation surface into a hosted MCP server your agents can
            actually use.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {USE_CASES.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <article
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl transition-all duration-500 hover:border-border hover:bg-card/60 sm:p-8",
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0"
                )}
                key={uc.id}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div
                  className={cn(
                    "-z-10 pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    uc.accent
                  )}
                />
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/60 backdrop-blur">
                    <Icon className="size-4 text-foreground/80" />
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
                    {uc.badge}
                  </span>
                </div>
                <h3 className="mt-5 font-display font-semibold text-xl leading-tight tracking-tight sm:text-2xl">
                  {uc.title}
                </h3>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed sm:text-base">
                  {uc.body}
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  {uc.bullets.map((b) => (
                    <li
                      className="flex items-start gap-2.5 text-foreground/80"
                      key={b}
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1 shrink-0 rounded-full bg-foreground/60"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-12 grid grid-cols-2 gap-2 rounded-2xl border border-border/40 bg-card/30 p-4 backdrop-blur-xl sm:grid-cols-4 sm:gap-4 sm:p-6">
          {TRUST_ROW.map((t) => {
            const Icon = t.icon;
            return (
              <div
                className="flex items-center gap-2.5 text-foreground/80"
                key={t.label}
              >
                <Icon className="size-4 shrink-0 text-foreground/60" />
                <span className="font-mono text-[11px] uppercase tracking-wider sm:text-xs">
                  {t.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
