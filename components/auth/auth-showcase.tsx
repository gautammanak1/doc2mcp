"use client";

import {
  Boxes,
  Globe,
  Layers,
  Network,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

const ROTATING_TAGLINES = [
  "Paste docs → ship MCP",
  "Tools, not endpoints",
  "Workflows, inferred",
  "AI-native, by default",
] as const;

const SHOWCASE_TOOLS = [
  { name: "create_customer", group: "Billing toolkit" },
  { name: "issue_refund", group: "Billing toolkit" },
  { name: "upload_invoice", group: "File toolkit" },
  { name: "open_support_ticket", group: "Support toolkit" },
  { name: "rotate_api_key", group: "Auth toolkit" },
] as const;

const STREAM_LINES = [
  { label: "crawl", text: "docs.stripe.com · 412 pages" },
  { label: "parse", text: "openapi.yaml · 287 endpoints" },
  { label: "infer", text: "5 workflows detected" },
  { label: "group", text: "→ Billing, Subscriptions, Webhooks" },
  { label: "compress", text: "287 endpoints → 23 semantic tools" },
  { label: "ship", text: "MCP server ready · /mcp/stripe" },
] as const;

export function AuthShowcase() {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [streamIndex, setStreamIndex] = useState(0);

  useEffect(() => {
    const tag = setInterval(
      () => setTaglineIndex((i) => (i + 1) % ROTATING_TAGLINES.length),
      2400
    );
    const stream = setInterval(
      () => setStreamIndex((i) => (i + 1) % (STREAM_LINES.length + 2)),
      900
    );
    return () => {
      clearInterval(tag);
      clearInterval(stream);
    };
  }, []);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-tl-2xl bg-gradient-to-br from-background via-background to-violet-500/10 dark:to-violet-950/40">
      <div
        aria-hidden="true"
        className="-top-32 -left-32 pointer-events-none absolute size-96 rounded-full bg-violet-500/20 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="-bottom-32 -right-32 pointer-events-none absolute size-96 rounded-full bg-fuchsia-500/15 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex h-14 shrink-0 items-center gap-3 border-b border-border/20 px-6">
        <div className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
          <Sparkles className="size-3" />
        </div>
        <span className="font-mono text-[12px] text-foreground/80 tracking-wider">
          doc2mcp · AI-native
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          live
        </span>
      </div>

      <div className="relative flex flex-1 flex-col justify-center gap-8 px-10 pb-10">
        <div>
          <p className="font-mono text-[11px] text-violet-700/90 uppercase tracking-[0.2em] dark:text-violet-300/80">
            The smartest way
          </p>
          <h2
            className="mt-3 font-display font-bold text-4xl leading-[1.05] tracking-tight"
            key={taglineIndex}
            style={{ animation: "char-in 600ms ease-out both" }}
          >
            {ROTATING_TAGLINES[taglineIndex]}
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground text-sm leading-relaxed">
            Group APIs intelligently. Infer workflows. Generate semantic
            toolkits. Cursor, Claude, Windsurf — connect in seconds.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FeatureCard
            icon={Workflow}
            label="Workflow AI"
            tint="from-violet-500/20 to-fuchsia-500/10"
          />
          <FeatureCard
            icon={Layers}
            label="Smart toolkits"
            tint="from-sky-500/20 to-cyan-500/10"
          />
          <FeatureCard
            icon={Network}
            label="Visual graph"
            tint="from-emerald-500/20 to-teal-500/10"
          />
          <FeatureCard
            icon={Zap}
            label="Live playground"
            tint="from-amber-500/20 to-orange-500/10"
          />
        </div>

        <div className="rounded-xl border border-border/50 bg-card/70 p-4 shadow-xl shadow-foreground/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 border-border/40 border-b pb-2">
            <span className="size-2 rounded-full bg-rose-400/80" />
            <span className="size-2 rounded-full bg-amber-400/80" />
            <span className="size-2 rounded-full bg-emerald-400/80" />
            <span className="ml-2 font-mono text-[10px] text-muted-foreground">
              pipeline.log
            </span>
            <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-violet-700 dark:text-violet-300">
              <Globe className="size-2.5" />
              asi1
            </span>
          </div>
          <ul className="mt-3 space-y-1.5 font-mono text-[11px] text-muted-foreground">
            {STREAM_LINES.slice(
              0,
              Math.min(streamIndex + 1, STREAM_LINES.length)
            ).map((line) => (
              <li
                className="flex items-start gap-2 opacity-0"
                key={line.label}
                style={{ animation: "char-in 350ms ease-out forwards" }}
              >
                <span className="text-violet-700 dark:text-violet-300">
                  {line.label}
                </span>
                <span className="text-muted-foreground/60">›</span>
                <span className="text-foreground/80">{line.text}</span>
              </li>
            ))}
            {streamIndex >= STREAM_LINES.length ? (
              <li className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <Boxes className="size-3" />
                <span>5 toolkits · 23 tools · 0 endpoints leaked</span>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <p className="mb-2 font-mono text-[10px] text-muted-foreground/70 uppercase tracking-wider">
            Generated semantic tools
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SHOWCASE_TOOLS.map((tool) => (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/60 px-2.5 py-1 font-mono text-[10px] text-foreground/80 backdrop-blur"
                key={tool.name}
                title={tool.group}
              >
                <span className="size-1 rounded-full bg-violet-400" />
                {tool.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  label,
  tint,
}: {
  icon: typeof Workflow;
  label: string;
  tint: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br ${tint} p-3 backdrop-blur-xl`}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-foreground/80" />
        <span className="font-medium text-foreground/90 text-xs">{label}</span>
      </div>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground/70 uppercase tracking-wider">
        included
      </p>
    </div>
  );
}
