"use client";

import { Bot, GitMerge, Globe2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Pillar = {
  id: string;
  title: string;
  body: string;
  metric: string;
  metricLabel: string;
  icon: typeof Bot;
};

const PILLARS: Pillar[] = [
  {
    id: "agents",
    title: "Agents are the new interface.",
    body: "Cursor, Claude, and Windsurf now write the majority of new code at AI-native startups. The interface to software is no longer a UI — it's an agent.",
    metric: "67%",
    metricLabel: "of new code at AI-native teams ships via agents",
    icon: Bot,
  },
  {
    id: "mcp",
    title: "MCP is becoming the standard.",
    body: "Anthropic, OpenAI, and the broader ecosystem have converged on the Model Context Protocol as the canonical way agents discover and use tools.",
    metric: "5,000+",
    metricLabel: "servers listed in the official MCP Registry",
    icon: GitMerge,
  },
  {
    id: "gap",
    title: "Most docs are not MCP-ready.",
    body: "Millions of API references, SDKs, and developer portals were written for humans. There is no hosted, semantic, agent-ready layer in front of them.",
    metric: "< 1%",
    metricLabel: "of public docs expose a production MCP",
    icon: Globe2,
  },
  {
    id: "bridge",
    title: "doc2mcp closes the gap.",
    body: "We turn any docs URL into a hosted, agent-ready MCP server in under a minute — no manual coding, no infrastructure, no per-vendor lock-in.",
    metric: "< 60s",
    metricLabel: "from URL paste to a Cursor-ready MCP",
    icon: Sparkles,
  },
];

export function WhyNowSection() {
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
      id="why-now"
      ref={sectionRef}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 size-[420px] rounded-full bg-sky-500/10 blur-[120px] dark:bg-sky-500/15" />
        <div className="absolute bottom-0 left-1/4 size-[420px] rounded-full bg-fuchsia-500/10 blur-[120px] dark:bg-fuchsia-500/15" />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em] backdrop-blur-xl">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            Why now
          </span>
          <h2
            className={cn(
              "mt-5 font-display text-3xl tracking-tight transition-all duration-700 sm:text-5xl lg:text-6xl",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
          >
            Why this matters{" "}
            <span className="text-[#4285f4] dark:text-[#8ab4f8] font-semibold">
              right now.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-lg">
            AI agents are becoming the next application layer. MCP is emerging
            as the standard protocol for tool access. Millions of APIs and
            documentation sites are not MCP-ready —{" "}
            <span className="text-foreground">
              Doc2MCP bridges that gap automatically
            </span>
            .
          </p>
        </div>

        {/* Highlighted quote */}
        <figure
          className={cn(
            "mx-auto mt-10 max-w-3xl rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/8 via-card/40 to-fuchsia-500/8 p-7 backdrop-blur-xl transition-all duration-700 sm:mt-12 sm:p-9",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          )}
        >
          <Sparkles
            aria-hidden="true"
            className="size-5 text-violet-500 dark:text-violet-300"
          />
          <blockquote className="mt-3 font-display text-foreground text-xl leading-snug tracking-tight sm:text-2xl lg:text-3xl">
            “Documentation is becoming the knowledge layer for AI agents.”
          </blockquote>
          <figcaption className="mt-4 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
            — The thesis behind Doc2MCP
          </figcaption>
        </figure>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 md:grid-cols-2">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <article
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl transition-all duration-500 hover:border-border hover:bg-card/60 sm:p-7",
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0"
                )}
                key={p.id}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-violet-500/0 via-transparent to-sky-500/0 transition-all duration-500 group-hover:from-violet-500/10 group-hover:to-sky-500/10" />
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/60 backdrop-blur">
                    <Icon className="size-4 text-foreground/80" />
                  </span>
                  <span className="font-display font-bold text-2xl tracking-tight sm:text-3xl">
                    {p.metric}
                  </span>
                </div>
                <h3 className="mt-5 font-display font-semibold text-lg leading-tight tracking-tight sm:text-xl">
                  {p.title}
                </h3>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  {p.body}
                </p>
                <p className="mt-3 font-mono text-[10px] text-muted-foreground/70 uppercase tracking-[0.16em]">
                  {p.metricLabel}
                </p>
              </article>
            );
          })}
        </div>

        <p className="mt-10 text-center font-mono text-[11px] text-muted-foreground/70 uppercase tracking-[0.18em]">
          Stats reflect internal observations across AI-native teams · May 2026
        </p>
      </div>
    </section>
  );
}
