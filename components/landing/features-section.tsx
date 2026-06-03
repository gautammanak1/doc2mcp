"use client";

import {
  Bot,
  Check,
  Download,
  FileText,
  Folder,
  type LucideIcon,
  Network,
  RefreshCw,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const CRAWLER_TREE = [
  { kind: "folder", label: "/docs", indent: 0, delay: 0 },
  { kind: "file", label: "introduction.mdx", indent: 1, delay: 0.3 },
  { kind: "file", label: "quickstart.mdx", indent: 1, delay: 0.6 },
  { kind: "folder", label: "/api", indent: 1, delay: 0.9 },
  { kind: "file", label: "customers.mdx", indent: 2, delay: 1.2 },
  { kind: "file", label: "payment_intents.mdx", indent: 2, delay: 1.5 },
  { kind: "file", label: "webhooks.mdx", indent: 2, delay: 1.8 },
  { kind: "folder", label: "/sdks", indent: 1, delay: 2.1 },
  { kind: "file", label: "node.mdx", indent: 2, delay: 2.4 },
  { kind: "file", label: "python.mdx", indent: 2, delay: 2.7 },
] as const;

function CrawlerVisual() {
  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden rounded-xl border border-border/40 bg-background/40 p-3 backdrop-blur-xl sm:min-h-[320px]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-border/30 border-b pb-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-rose-400/60" />
          <span className="size-2 rounded-full bg-amber-400/60" />
          <span className="size-2 rounded-full bg-emerald-400/60" />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          docs.stripe.com · sitemap
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
          <span className="crawler-pulse-dot size-1.5 rounded-full bg-emerald-500" />
          crawling
        </span>
      </div>

      {/* File tree */}
      <ul className="mt-2.5 space-y-1 font-mono text-[11px]">
        {CRAWLER_TREE.map((row, i) => (
          <li
            className="crawler-row flex items-center gap-1.5"
            key={`${row.label}-${String(i)}`}
            style={{
              paddingLeft: `${row.indent * 14}px`,
              animationDelay: `${row.delay}s`,
            }}
          >
            {row.kind === "folder" ? (
              <Folder
                aria-hidden="true"
                className="size-3 shrink-0 text-violet-500"
              />
            ) : (
              <FileText
                aria-hidden="true"
                className="size-3 shrink-0 text-foreground/55"
              />
            )}
            <span
              className={cn(
                "truncate",
                row.kind === "folder"
                  ? "text-foreground/85"
                  : "text-muted-foreground"
              )}
            >
              {row.label}
            </span>
            <Check
              aria-hidden="true"
              className="crawler-check ml-auto size-3 shrink-0 text-emerald-500"
              style={{ animationDelay: `${row.delay + 0.4}s` }}
            />
          </li>
        ))}
      </ul>

      {/* Scanner line */}
      <span className="crawler-scanner pointer-events-none absolute inset-x-3 top-10 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />

      {/* Stats footer */}
      <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between border-border/30 border-t pt-2 font-mono text-[10px]">
        <span className="text-muted-foreground">pages indexed</span>
        <span className="font-display font-semibold text-foreground/85 text-sm">
          1,284
        </span>
      </div>

      <style>{`
        .crawler-row {
          opacity: 0;
          animation: crawler-row-in 0.4s ease-out both, crawler-row-loop 12s ease-in-out infinite;
        }
        @keyframes crawler-row-in {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes crawler-row-loop {
          0%, 25%   { opacity: 1; }
          70%, 100% { opacity: 1; }
        }
        .crawler-check {
          opacity: 0;
          animation: crawler-check-in 0.3s ease-out both;
        }
        @keyframes crawler-check-in {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        .crawler-scanner {
          animation: crawler-scan 3.6s ease-in-out infinite;
        }
        @keyframes crawler-scan {
          0%   { transform: translateY(0);   opacity: 0; }
          10%  { opacity: 0.9; }
          90%  { opacity: 0.9; }
          100% { transform: translateY(220px); opacity: 0; }
        }
        .crawler-pulse-dot {
          animation: crawler-dot-pulse 1.2s ease-in-out infinite;
        }
        @keyframes crawler-dot-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          50%      { opacity: 0.6; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .crawler-row, .crawler-check, .crawler-scanner, .crawler-pulse-dot {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

type Feature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  span: string; // tailwind grid span classes
  accent: string; // gradient accent for glow
  visual: "crawler" | "mcp" | "retrieval" | "sync" | "agents" | "export";
};

const features: Feature[] = [
  {
    id: "crawler",
    title: "Smart Documentation Crawling",
    description:
      "Automatically understands documentation hierarchy and structure — Mintlify, Docusaurus, Swagger, GitBook, raw markdown.",
    icon: Network,
    span: "lg:col-span-2 lg:row-span-2",
    accent: "from-sky-500/20 via-violet-500/10 to-transparent",
    visual: "crawler",
  },
  {
    id: "mcp",
    title: "Production Ready MCP Generation",
    description:
      "Generate MCP servers without writing MCP code. Tools, workflows, auth, hosting — done.",
    icon: Workflow,
    span: "lg:col-span-2",
    accent: "from-violet-500/20 via-fuchsia-500/10 to-transparent",
    visual: "mcp",
  },
  {
    id: "retrieval",
    title: "Agent Optimized Retrieval",
    description:
      "Improve AI coding accuracy and reduce hallucinations with semantic, schema-aware retrieval.",
    icon: Target,
    span: "lg:col-span-2",
    accent: "from-fuchsia-500/20 via-rose-500/10 to-transparent",
    visual: "retrieval",
  },
  {
    id: "sync",
    title: "Live Documentation Sync",
    description:
      "Keep documentation synchronized automatically — your MCP server tracks the source.",
    icon: RefreshCw,
    span: "lg:col-span-2",
    accent: "from-emerald-500/20 via-sky-500/10 to-transparent",
    visual: "sync",
  },
  {
    id: "agents",
    title: "Multi-Agent Compatibility",
    description:
      "Works across the modern MCP ecosystem — Cursor, Claude, VS Code, Windsurf, OpenAI Agents.",
    icon: Bot,
    span: "lg:col-span-2",
    accent: "from-amber-500/20 via-orange-500/10 to-transparent",
    visual: "agents",
  },
  {
    id: "export",
    title: "One Click Export",
    description:
      "Instant MCP configuration generation. Copy a JSON snippet, paste into your editor, done.",
    icon: Download,
    span: "lg:col-span-2",
    accent: "from-cyan-500/20 via-blue-500/10 to-transparent",
    visual: "export",
  },
];

function CardVisual({ visual }: { visual: Feature["visual"] }) {
  if (visual === "crawler") {
    return <CrawlerVisual />;
  }
  if (visual === "mcp") {
    return (
      <div className="relative h-full min-h-[120px] w-full overflow-hidden rounded-xl border border-border/40 bg-background/40 p-3 font-mono text-[10px] backdrop-blur-xl">
        <p className="text-emerald-500">$ doc2mcp generate ./stripe-docs</p>
        <p className="text-muted-foreground">→ crawled 1,284 pages</p>
        <p className="text-muted-foreground">→ structured 4,182 chunks</p>
        <p className="text-muted-foreground">→ tools: 23 · workflows: 6</p>
        <p className="text-violet-500">✓ mcp ready · hosted</p>
      </div>
    );
  }
  if (visual === "retrieval") {
    return (
      <div className="relative flex h-full min-h-[120px] w-full flex-col justify-center gap-1.5">
        {[
          { label: "createCustomer", score: "0.94" },
          { label: "retrievePaymentIntent", score: "0.89" },
          { label: "listSubscriptions", score: "0.82" },
        ].map((row, i) => (
          <div
            className="flex items-center justify-between rounded-lg border border-border/40 bg-card/60 px-3 py-1.5 text-[11px] backdrop-blur-xl"
            key={row.label}
          >
            <span className="font-mono text-foreground/85">{row.label}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px]",
                i === 0
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-foreground/5 text-muted-foreground"
              )}
            >
              {row.score}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (visual === "sync") {
    return (
      <div className="relative flex h-full min-h-[120px] w-full items-center justify-center">
        <span className="relative inline-flex size-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
          <RefreshCw
            className="size-7 animate-spin text-emerald-500"
            style={{ animationDuration: "4s" }}
          />
          <span className="-inset-2 absolute rounded-full border border-emerald-500/20" />
          <span className="-inset-5 absolute rounded-full border border-emerald-500/10" />
        </span>
      </div>
    );
  }
  if (visual === "agents") {
    return (
      <div className="relative flex h-full min-h-[120px] w-full flex-wrap items-center justify-center gap-1.5">
        {["Cursor", "Claude", "VS Code", "Windsurf", "OpenAI"].map(
          (label, i) => (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 font-mono text-[10px] text-foreground/80 uppercase tracking-wider backdrop-blur-xl"
              key={label}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {label}
            </span>
          )
        )}
      </div>
    );
  }
  // export
  return (
    <div className="relative h-full min-h-[120px] w-full overflow-hidden rounded-xl border border-border/40 bg-background/40 p-3 font-mono text-[10px] text-muted-foreground backdrop-blur-xl">
      <pre className="whitespace-pre">{`{
  "mcpServers": {
    "stripe": {
      "url": "https://…",
      "headers": { "Authorization": "Bearer …" }
    }
  }
}`}</pre>
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = feature.icon;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "group relative col-span-1 overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl transition-all duration-700 hover:border-border sm:p-7",
        feature.span,
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}
      ref={cardRef}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          feature.accent
        )}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />

      <div className="flex h-full flex-col justify-between gap-5">
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-background/60 text-foreground/85">
              <Icon className="size-4" />
            </span>
          </div>
          <h3 className="font-display font-semibold text-foreground text-lg tracking-tight sm:text-xl">
            {feature.title}
          </h3>
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
            {feature.description}
          </p>
        </div>

        <div className="text-foreground/70 transition-transform duration-500 group-hover:translate-y-[-2px]">
          <CardVisual visual={feature.visual} />
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
      className="relative overflow-hidden py-20 sm:py-24 lg:py-32"
      id="features"
      ref={sectionRef}
    >
      <div
        aria-hidden="true"
        className="-top-20 -translate-x-1/2 pointer-events-none absolute left-1/2 size-[560px] rounded-full bg-violet-500/10 blur-[140px]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-12">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <span
            className={cn(
              "mb-5 inline-flex items-center gap-3 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.18em] transition-all duration-700",
              isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <span className="h-px w-8 bg-foreground/30" />
            Platform
            <span className="h-px w-8 bg-foreground/30" />
          </span>
          <h2
            className={cn(
              "font-display text-3xl tracking-tight transition-all duration-700 sm:text-5xl lg:text-6xl",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
          >
            One platform.{" "}
            <span className="bg-gradient-to-br from-sky-400 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Every layer
            </span>{" "}
            of AI documentation infrastructure.
          </h2>
          <p
            className={cn(
              "mt-5 text-base text-muted-foreground leading-relaxed transition-all duration-700 sm:text-lg",
              isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            From crawl to retrieval to deployment — the full stack between your
            docs and an AI agent.
          </p>
          <div
            className={cn(
              "mt-6 inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-[10px] text-violet-700 uppercase tracking-[0.16em] transition-all duration-700 dark:text-violet-200",
              isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <Sparkles aria-hidden="true" className="size-3" />6 capabilities · 1
            endpoint
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-6 lg:auto-rows-[minmax(220px,auto)]">
          {features.map((feature, index) => (
            <FeatureCard feature={feature} index={index} key={feature.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
