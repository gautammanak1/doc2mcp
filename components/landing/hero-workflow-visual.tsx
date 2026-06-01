"use client";

/**
 * Hero animated workflow visual: documentation -> smart crawling ->
 * knowledge processing -> MCP generation -> AI agent.
 *
 * Pure CSS / SVG. No external deps. Designed to render at desktop sizes
 * (>=lg) as a glowing network diagram with floating cards along the
 * gradient pipeline. Hidden on mobile to keep the hero light.
 */

import {
  Bot,
  Cpu,
  FileCode2,
  type LucideIcon,
  Network,
  ScrollText,
  Sparkles,
} from "lucide-react";

type Stage = {
  id: string;
  label: string;
  body: string;
  icon: LucideIcon;
  accent: string;
};

const STAGES: Stage[] = [
  {
    id: "docs",
    label: "Documentation",
    body: "docs.stripe.com",
    icon: ScrollText,
    accent: "from-sky-500/40 to-sky-500/0",
  },
  {
    id: "crawler",
    label: "Smart Crawling",
    body: "1,284 pages indexed",
    icon: Network,
    accent: "from-violet-500/40 to-violet-500/0",
  },
  {
    id: "processing",
    label: "Knowledge Processing",
    body: "ASI1 · semantic chunks",
    icon: Cpu,
    accent: "from-fuchsia-500/40 to-fuchsia-500/0",
  },
  {
    id: "mcp",
    label: "MCP Generation",
    body: "23 tools · 6 workflows",
    icon: FileCode2,
    accent: "from-amber-500/40 to-amber-500/0",
  },
  {
    id: "agent",
    label: "AI Agent",
    body: "Cursor · Claude · Windsurf",
    icon: Bot,
    accent: "from-emerald-500/40 to-emerald-500/0",
  },
];

export function HeroWorkflowVisual() {
  return (
    <div
      aria-hidden="true"
      className="hero-workflow pointer-events-none relative h-full w-full select-none"
    >
      {/* Background grid + radial glow */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, currentColor 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, currentColor 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      <div className="absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-[100px]" />
      <div className="absolute top-[30%] left-[20%] size-40 rounded-full bg-sky-500/20 blur-[80px]" />
      <div className="absolute right-[15%] bottom-[20%] size-48 rounded-full bg-fuchsia-500/20 blur-[80px]" />

      {/* Floating particles */}
      {Array.from({ length: 16 }, (_, i) => i).map((i) => (
        <span
          className="hero-particle absolute size-1 rounded-full bg-foreground/30"
          key={`particle-${String(i)}`}
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            animationDelay: `${(i % 5) * 0.6}s`,
            animationDuration: `${6 + (i % 4)}s`,
          }}
        />
      ))}

      {/* Vertical connector line with travelling pulse */}
      <div className="-translate-x-1/2 absolute top-[6%] bottom-[6%] left-1/2 w-px overflow-hidden bg-gradient-to-b from-transparent via-foreground/15 to-transparent">
        <span className="hero-pulse absolute left-0 h-12 w-px bg-gradient-to-b from-transparent via-violet-400 to-transparent" />
      </div>

      {/* Stage cards */}
      <div className="relative flex h-full flex-col items-center justify-between gap-3 py-2">
        {STAGES.map((stage, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div
              className="flex w-full max-w-[300px] items-center justify-center"
              key={stage.id}
              style={{ animationDelay: `${i * 280}ms` }}
            >
              <StageCard align={isLeft ? "left" : "right"} stage={stage} />
            </div>
          );
        })}
      </div>

      <style>{`
        .hero-workflow .hero-particle {
          animation-name: hero-particle-float;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          opacity: 0.5;
        }
        @keyframes hero-particle-float {
          0%, 100% {
            transform: translate3d(0, 0, 0);
            opacity: 0.15;
          }
          50% {
            transform: translate3d(8px, -14px, 0);
            opacity: 0.7;
          }
        }
        .hero-workflow .hero-pulse {
          animation: hero-pulse-travel 3.6s linear infinite;
        }
        @keyframes hero-pulse-travel {
          0%   { top: -10%; opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .hero-workflow .stage-card {
          animation: hero-stage-rise 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes hero-stage-rise {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-workflow .hero-particle,
          .hero-workflow .hero-pulse,
          .hero-workflow .stage-card {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function StageCard({
  stage,
  align,
}: {
  stage: Stage;
  align: "left" | "right";
}) {
  const Icon = stage.icon;
  return (
    <div
      className={`stage-card group relative w-full ${
        align === "left" ? "mr-auto" : "ml-auto"
      }`}
    >
      <div
        className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r ${stage.accent} blur-xl opacity-60`}
      />
      <div className="relative flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 px-3.5 py-2.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/60 text-foreground/85">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-foreground text-xs sm:text-sm">
            {stage.label}
          </p>
          <p className="truncate font-mono text-[10px] text-muted-foreground sm:text-[11px]">
            {stage.body}
          </p>
        </div>
        <Sparkles
          aria-hidden="true"
          className="size-3 shrink-0 text-violet-400 opacity-70"
        />
      </div>
    </div>
  );
}
