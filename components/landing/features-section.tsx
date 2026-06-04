"use client";

import {
  Bot,
  Check,
  FileText,
  Folder,
  Network,
  RefreshCw,
  Target,
  Lock,
  HardDrive,
  Users2
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
    <div className="relative h-full min-h-[260px] w-full overflow-hidden rounded-xl border border-border/40 bg-secondary/20 p-3.5 backdrop-blur-xl sm:min-h-[300px]">
      <div className="flex items-center justify-between border-border/30 border-b pb-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#4285f4]" />
          <span className="size-2 rounded-full bg-[#8ab4f8]" />
          <span className="size-2 rounded-full bg-[#dadce0]" />
        </div>
        <span className="font-mono text-[9px] text-muted-foreground/75 uppercase tracking-wider">
          docs.stripe.com · crawl
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[9px] text-[#4285f4]">
          <span className="crawler-pulse-dot size-1.5 rounded-full bg-[#4285f4]" />
          indexing
        </span>
      </div>

      <ul className="mt-3 space-y-1 font-mono text-[10px]">
        {CRAWLER_TREE.map((row, i) => (
          <li
            className="crawler-row flex items-center gap-1.5"
            key={`${row.label}-${String(i)}`}
            style={{
              paddingLeft: `${row.indent * 12}px`,
              animationDelay: `${row.delay}s`,
            }}
          >
            {row.kind === "folder" ? (
              <Folder aria-hidden="true" className="size-3 shrink-0 text-[#4285f4]" />
            ) : (
              <FileText aria-hidden="true" className="size-3 shrink-0 text-muted-foreground/60" />
            )}
            <span className={cn("truncate", row.kind === "folder" ? "text-foreground font-medium" : "text-muted-foreground")}>
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

      <span className="crawler-scanner pointer-events-none absolute inset-x-3 top-12 h-px bg-gradient-to-r from-transparent via-[#4285f4]/70 to-transparent" />

      <style>{`
        .crawler-row {
          opacity: 0;
          animation: crawler-row-in 0.4s ease-out both, crawler-row-loop 12s ease-in-out infinite;
        }
        @keyframes crawler-row-in {
          from { opacity: 0; transform: translateX(-4px); }
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
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
        .crawler-scanner {
          animation: crawler-scan 3.6s ease-in-out infinite;
        }
        @keyframes crawler-scan {
          0%   { transform: translateY(0);   opacity: 0; }
          10%  { opacity: 0.9; }
          90%  { opacity: 0.9; }
          100% { transform: translateY(180px); opacity: 0; }
        }
        .crawler-pulse-dot {
          animation: crawler-dot-pulse 1.2s ease-in-out infinite;
        }
        @keyframes crawler-dot-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4); }
          50%      { opacity: 0.5; box-shadow: 0 0 0 4px rgba(66, 133, 244, 0); }
        }
      `}</style>
    </div>
  );
}

type Feature = {
  id: string;
  title: string;
  description: string;
  icon: any;
  span: string;
  visual: "crawler" | "mcp" | "retrieval" | "sync" | "security" | "scale" | "collab" | "agents";
};

const features: Feature[] = [
  {
    id: "crawler",
    title: "Sitemap Documentation Crawling",
    description: "Auto-crawls schemas and articles from any portal—Mintlify, Docusaurus, GitHub repositories, or raw HTML pages.",
    icon: Network,
    span: "lg:col-span-2 lg:row-span-2",
    visual: "crawler",
  },
  {
    id: "mcp",
    title: "Production Ready MCP Generation",
    description: "Generate and deploy hosted Model Context Protocol servers automatically. Done in seconds with zero custom config.",
    icon: Bot,
    span: "lg:col-span-1",
    visual: "mcp",
  },
  {
    id: "retrieval",
    title: "Agent-Optimized Retrieval",
    description: "Stop LLM hallucinations. Serve clean heading-aware chunks, parameter definitions, and schemas directly to AI clients.",
    icon: Target,
    span: "lg:col-span-1",
    visual: "retrieval",
  },
  {
    id: "sync",
    title: "Live Documentation Sync",
    description: "Your remote servers pull down the newest updates every 24h. Say goodbye to outdated code blocks and broken paths.",
    icon: RefreshCw,
    span: "lg:col-span-1",
    visual: "sync",
  },
  {
    id: "security",
    title: "Privacy First Security",
    description: "No local clones or shared keys. Remote token authentication guarantees secure, credential-free read operations.",
    icon: Lock,
    span: "lg:col-span-1",
    visual: "security",
  },
  {
    id: "scale",
    title: "Enterprise Scale Limits",
    description: "Parse extensive schemas of 2500+ documentation pages, heavy OpenAPI specifications, and multi-nested repositories.",
    icon: HardDrive,
    span: "lg:col-span-1",
    visual: "scale",
  },
  {
    id: "collab",
    title: "Teammate Collaboration",
    description: "Share servers across engineering teams, manage access scopes, and deploy custom domain endpoints for internal agents.",
    icon: Users2,
    span: "lg:col-span-1",
    visual: "collab",
  },
  {
    id: "agents",
    title: "Seamless Workspace Integration",
    description: "Copy-paste standard credentials directly into your editor config file. Fully supports Cursor, Claude, Windsurf, VS Code, or custom AI agents.",
    icon: Bot,
    span: "lg:col-span-2",
    visual: "agents",
  },
];

function CardVisual({ visual }: { visual: Feature["visual"] }) {
  if (visual === "crawler") {
    return <CrawlerVisual />;
  }
  if (visual === "mcp") {
    return (
      <div className="relative h-full min-h-[110px] w-full overflow-hidden rounded-xl border border-border/40 bg-secondary/10 p-3 font-mono text-[9px] text-muted-foreground">
        <p className="text-[#4285f4]">$ doc2mcp pipeline --init</p>
        <p className="mt-1">→ parsing sitemaps ... [ok]</p>
        <p>→ creating embeddings ... [ok]</p>
        <p className="text-[#4285f4] dark:text-[#8ab4f8]">✓ server online at doc2mcp.site/api/mcp/st_92k</p>
      </div>
    );
  }
  if (visual === "retrieval") {
    return (
      <div className="relative flex h-full min-h-[110px] w-full flex-col justify-center gap-1">
        {[
          { label: "checkoutSession", score: "96%" },
          { label: "createCustomer", score: "89%" },
          { label: "cancelSubscription", score: "74%" },
        ].map((row, i) => (
          <div
            className="flex items-center justify-between rounded-lg border border-border/40 bg-card/65 px-3 py-1.5 text-[10px] backdrop-blur-sm"
            key={row.label}
          >
            <span className="font-mono text-foreground">{row.label}</span>
            <span className={cn(
              "font-mono text-[9px] px-1.5 py-0.5 rounded-full font-medium",
              i === 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
            )}>
              {row.score}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (visual === "sync") {
    return (
      <div className="relative flex h-full min-h-[110px] w-full items-center justify-center">
        <span className="relative inline-flex size-14 items-center justify-center rounded-full border border-border/60 bg-secondary/20">
          <RefreshCw
            className="size-5 animate-spin text-[#4285f4] dark:text-[#8ab4f8]"
            style={{ animationDuration: "5s" }}
          />
        </span>
      </div>
    );
  }
  if (visual === "security") {
    return (
      <div className="relative flex h-full min-h-[110px] w-full flex-col justify-center gap-2">
        <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-card/65 px-3 py-2 text-[10px]">
          <span className="flex size-6 items-center justify-center rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Check className="size-3" />
          </span>
          <div>
            <p className="font-medium text-foreground">API key protection</p>
            <p className="text-muted-foreground text-[9px]">Keys never saved</p>
          </div>
        </div>
      </div>
    );
  }
  if (visual === "scale") {
    return (
      <div className="relative flex h-full min-h-[110px] w-full items-center justify-center">
        <div className="text-center">
          <span className="text-2xl font-semibold tracking-tight text-foreground font-mono">2,500+</span>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Pages indexed / site</p>
        </div>
      </div>
    );
  }
  if (visual === "collab") {
    return (
      <div className="relative flex h-full min-h-[110px] w-full items-center justify-center">
        <div className="flex -space-x-2">
          {["A", "K", "S"].map((initial, i) => (
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full border border-card font-mono text-[10px] text-white font-semibold",
                i === 0 ? "bg-[#4285f4]" : i === 1 ? "bg-[#8ab4f8]" : "bg-neutral-600"
              )}
              key={initial}
            >
              {initial}
            </span>
          ))}
          <span className="flex size-7 items-center justify-center rounded-full border border-card bg-secondary text-muted-foreground font-mono text-[9px]">
            +5
          </span>
        </div>
      </div>
    );
  }
  
  // agents
  return (
    <div className="relative flex h-full min-h-[110px] w-full items-center justify-center flex-wrap gap-1.5 p-2">
      {["Cursor", "Claude.desktop", "Windsurf", "VS Code", "OpenAI Agents"].map((label) => (
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/65 px-3 py-1 font-mono text-[9px] text-muted-foreground uppercase tracking-wider backdrop-blur-md"
          key={label}
        >
          <span className="size-1 rounded-full bg-[#4285f4] dark:bg-[#8ab4f8]" />
          {label}
        </span>
      ))}
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = feature.icon;

  return (
    <div
      className={cn(
        "group relative col-span-1 overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-border/80 flex flex-col justify-between gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]",
        feature.span
      )}
      ref={cardRef}
    >
      <div>
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-secondary/40 text-muted-foreground/80">
            <Icon className="size-4" />
          </span>
        </div>
        <h3 className="font-display font-medium text-foreground text-base tracking-tight">
          {feature.title}
        </h3>
        <p className="mt-1.5 text-muted-foreground text-xs leading-relaxed">
          {feature.description}
        </p>
      </div>

      <div className="mt-2 text-foreground/80">
        <CardVisual visual={feature.visual} />
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
      className="relative overflow-hidden py-20 sm:py-28"
      id="features"
      ref={sectionRef}
    >
      {/* Spark Glow Element */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 dark:opacity-10 blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(66, 133, 244, 0.12) 0%, rgba(66, 133, 244, 0.03) 60%, transparent 100%)"
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <span
            className={cn(
              "mb-4 inline-flex items-center gap-3 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em] transition-all duration-700",
              isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            Capabilities
          </span>
          <h2
            className={cn(
              "font-display text-2xl font-semibold tracking-tight transition-all duration-700 sm:text-4xl lg:text-5xl text-foreground",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            Engineered for developers.{" "}
            <br className="hidden sm:block" />
            <span className="text-[#4285f4] dark:text-[#8ab4f8]">
              Trusted by teams.
            </span>
          </h2>
          <p
            className={cn(
              "mt-4 text-sm text-muted-foreground leading-relaxed transition-all duration-700",
              isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            The production-ready bridge connecting documentation portals directly to the local memory context of your coding assistants.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard feature={feature} index={index} key={feature.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
