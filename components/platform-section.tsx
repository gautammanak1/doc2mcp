"use client";

/**
 * PlatformSection — the "One platform. Every layer…" features grid.
 *
 * Six feature cards, each running a looping "live demo" animation that
 * visualizes what the feature does (Composio / Linear style). Entrances use
 * Framer Motion spring physics gated by `useInView`; the internal loops are
 * CSS `@keyframes` + small state machines using transform/opacity only.
 * Everything is disabled under `prefers-reduced-motion`.
 */

import {
  type MotionValue,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  Bot,
  Check,
  Copy,
  Download,
  FileText,
  Folder,
  type LucideIcon,
  Network,
  RefreshCw,
  Target,
  Workflow,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const HEADING_WORDS = [
  "One",
  "platform.",
  "Every",
  "layer",
  "of",
  "AI",
  "documentation",
  "infrastructure.",
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18, mass: 0.6 },
  },
} as const;

/* ----------------------------- 1. Crawling ------------------------------ */

const CRAWLER_TREE = [
  { kind: "folder", label: "/docs", indent: 0 },
  { kind: "file", label: "introduction.mdx", indent: 1 },
  { kind: "file", label: "quickstart.mdx", indent: 1 },
  { kind: "folder", label: "/api", indent: 1 },
  { kind: "file", label: "customers.mdx", indent: 2 },
  { kind: "file", label: "payment_intents.mdx", indent: 2 },
  { kind: "file", label: "webhooks.mdx", indent: 2 },
  { kind: "file", label: "node.mdx", indent: 2 },
] as const;

function useCountUp(
  target: number,
  active: boolean,
  durationMs = 1600
): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) {
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(eased * target));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs]);
  return value;
}

function CrawlingCard({ active }: { active: boolean }) {
  const [scanRow, setScanRow] = useState(-1);
  const reduce = useReducedMotion();
  const count = useCountUp(1284, active && !reduce);

  useEffect(() => {
    if (!active || reduce) {
      setScanRow(CRAWLER_TREE.length - 1);
      return;
    }
    let row = -1;
    const id = setInterval(() => {
      row = (row + 1) % (CRAWLER_TREE.length + 3);
      setScanRow(row);
    }, 450);
    return () => clearInterval(id);
  }, [active, reduce]);

  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden rounded-2xl border border-border/40 bg-card/25 p-4 backdrop-blur-md flex flex-col justify-between">
      {/* Chrome tab headers */}
      <div className="flex items-center justify-between border-border/30 border-b pb-3 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#ef4444] opacity-80" />
          <span className="size-2 rounded-full bg-[#f59e0b] opacity-80" />
          <span className="size-2 rounded-full bg-[#10b981] opacity-80" />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/85 tracking-wider">
          stripe_crawler.ts
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          active
        </span>
      </div>

      {/* Main tree list */}
      <ul className="flex-1 space-y-1.5 font-mono text-[11px] overflow-hidden py-1">
        {CRAWLER_TREE.map((row, i) => {
          const done = i <= scanRow;
          const scanning = i === scanRow;

          // Determine label type
          const isFolder = row.kind === "folder";
          const isAPI =
            row.label.includes("customers") ||
            row.label.includes("payment_intents") ||
            row.label.includes("webhooks");
          const fileBadge = isFolder ? "" : isAPI ? "API" : "DOC";

          return (
            <li
              className={cn(
                "relative flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-300",
                scanning
                  ? "bg-[#4285f4]/8 border border-[#4285f4]/20 scale-[1.01]"
                  : "border border-transparent",
                done ? "opacity-100" : "opacity-40"
              )}
              key={row.label}
              style={{ paddingLeft: `${row.indent * 12 + 6}px` }}
            >
              {isFolder ? (
                <Folder className="size-3.5 shrink-0 text-[#4285f4]" />
              ) : (
                <FileText className="size-3.5 shrink-0 text-muted-foreground/80" />
              )}
              <span
                className={cn(
                  "truncate font-medium transition-colors",
                  done ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {row.label}
              </span>
              {!isFolder && fileBadge && (
                <span
                  className={cn(
                    "text-[8px] font-bold px-1.5 py-0.2 rounded shrink-0 scale-90",
                    isAPI
                      ? "bg-[#4285f4]/15 text-[#4285f4] dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8]"
                      : "bg-neutral-500/15 text-neutral-400"
                  )}
                >
                  {fileBadge}
                </span>
              )}
              {scanning && (
                <span className="ml-auto flex items-center gap-1 text-[8.5px] text-[#4285f4] font-semibold animate-pulse">
                  scanning...
                </span>
              )}
              {done && !scanning && (
                <Check className="ml-auto size-3 text-emerald-500 shrink-0" />
              )}
            </li>
          );
        })}
      </ul>

      {/* Crawl stats overlay dashboard */}
      <div className="mt-3 grid grid-cols-2 gap-4 border-border/30 border-t pt-3 font-mono text-[10px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">Crawler Depth</span>
          <span className="font-semibold text-foreground text-xs font-display">
            Level 3
          </span>
        </div>
        <div className="flex flex-col gap-0.5 items-end">
          <span className="text-muted-foreground">Pages Scanned</span>
          <span className="font-semibold text-foreground text-xs font-display tabular-nums">
            {count.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- 2. MCP generation -------------------------- */

type TermFrame = {
  lines: string[];
  typing: string;
  cursor: boolean;
  delay: number;
};

const TERM_SCRIPT = [
  { text: "doc2mcp generate ./stripe-docs", kind: "cmd" },
  { text: "→ crawled 1,284 pages", kind: "out" },
  { text: "→ structured 4,182 chunks", kind: "out" },
  { text: "→ tools: 23 · workflows: 6", kind: "out" },
  { text: "✓ mcp ready · hosted", kind: "ok" },
] as const;

function buildTermFrames(): TermFrame[] {
  const frames: TermFrame[] = [];
  const committed: string[] = [];
  for (const line of TERM_SCRIPT) {
    if (line.kind === "cmd") {
      for (let i = 1; i <= line.text.length; i++) {
        frames.push({
          lines: [...committed],
          typing: line.text.slice(0, i),
          cursor: true,
          delay: 34,
        });
      }
      committed.push(`$ ${line.text}`);
      frames.push({
        lines: [...committed],
        typing: "",
        cursor: false,
        delay: 320,
      });
    } else {
      committed.push(line.text);
      frames.push({
        lines: [...committed],
        typing: "",
        cursor: false,
        delay: 340,
      });
    }
  }
  frames.push({ lines: [...committed], typing: "", cursor: true, delay: 2400 });
  return frames;
}

function MCPGenCard({ active }: { active: boolean }) {
  const frames = useMemo(buildTermFrames, []);
  const [idx, setIdx] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!active || reduce) {
      setIdx(frames.length - 1);
      return;
    }
    const frame = frames[idx] ?? frames[0];
    const timer = setTimeout(
      () => setIdx((p) => (p + 1) % frames.length),
      frame.delay
    );
    return () => clearTimeout(timer);
  }, [active, reduce, idx, frames]);

  const frame = frames[idx] ?? frames[0];

  return (
    <div className="relative flex h-full min-h-[120px] w-full flex-col justify-end overflow-hidden rounded-xl border border-border/40 bg-zinc-950/90 p-3 font-mono text-[10.5px] backdrop-blur-xl">
      {frame.lines.map((line) => {
        const isCmd = line.startsWith("$ ");
        const isOk = line.startsWith("✓");
        return (
          <p
            className={cn(
              "leading-relaxed",
              isOk
                ? "text-violet-400"
                : isCmd
                  ? "text-zinc-100"
                  : "text-emerald-400/90"
            )}
            key={line}
          >
            {isCmd ? (
              <>
                <span className="text-violet-400">$</span> {line.slice(2)}
              </>
            ) : (
              line
            )}
          </p>
        );
      })}
      {frame.typing ? (
        <p className="text-zinc-100">
          <span className="text-violet-400">$</span> {frame.typing}
          {frame.cursor ? (
            <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-zinc-100 align-middle" />
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

/* ---------------------------- 3. Retrieval ------------------------------ */

const RETRIEVAL_ROWS = [
  { label: "createCustomer", score: 0.94 },
  { label: "retrievePaymentIntent", score: 0.89 },
  { label: "listSubscriptions", score: 0.82 },
];

function RetrievalCard({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const animate = active && !reduce;
  return (
    <div className="relative flex h-full min-h-[120px] w-full flex-col justify-center gap-3">
      {/* Query Bar */}
      <div className="rounded-lg border border-border/40 bg-card/10 px-3 py-2 flex items-center gap-2 font-mono text-[10.5px] text-muted-foreground/80">
        <span className="text-[#4285f4] dark:text-[#8ab4f8] font-bold">Q:</span>
        <span className="truncate">
          Stripe checkout session redirect parameters...
        </span>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {RETRIEVAL_ROWS.map((row, i) => {
          const top = i === 0;
          return (
            <div
              className={cn(
                "rounded-lg border bg-card/65 px-3 py-2 backdrop-blur-xl transition-all duration-300",
                top
                  ? "border-[#4285f4]/45 shadow-[0_0_18px_-6px] shadow-[#4285f4]/40"
                  : "border-border/40"
              )}
              key={row.label}
              style={
                animate
                  ? {
                      animation: top
                        ? "pf-fade-in 0.5s ease-out both, pf-glow 2.4s ease-in-out infinite"
                        : "pf-fade-in 0.5s ease-out both",
                      animationDelay: `${i * 0.18}s`,
                    }
                  : undefined
              }
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-foreground/85 font-medium">
                  {row.label}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
                    top
                      ? "bg-[#4285f4]/15 text-[#4285f4] dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8]"
                      : "bg-foreground/5 text-muted-foreground"
                  )}
                >
                  {row.score.toFixed(2)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-foreground/10">
                <span
                  className={cn(
                    "block h-full rounded-full",
                    top
                      ? "bg-gradient-to-r from-[#4285f4] to-[#8ab4f8]"
                      : "bg-foreground/40"
                  )}
                  style={
                    reduce
                      ? { width: `${row.score * 100}%` }
                      : {
                          // CSS var drives the looping fill keyframe.
                          ["--pf-target" as string]: `${row.score * 100}%`,
                          width: `${row.score * 100}%`,
                          animation: "pf-bar 3s ease-in-out infinite",
                          animationDelay: `${i * 0.18}s`,
                        }
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ 4. Sync -------------------------------- */

function SyncCard({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative flex h-full min-h-[120px] w-full flex-col items-center justify-center py-4 bg-card/10 border border-border/40 rounded-2xl p-4">
      {/* Visual Sync Syncing Nodes */}
      <div className="flex items-center justify-between w-full max-w-[220px] relative">
        {/* Source Node */}
        <div className="flex flex-col items-center gap-1.5 z-10">
          <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-background shadow-sm">
            <FileText className="size-4.5 text-muted-foreground/80" />
          </div>
          <span className="font-mono text-[9px] text-muted-foreground">
            docs.stripe.com
          </span>
        </div>

        {/* Syncing line connector */}
        <div className="absolute left-[40px] right-[40px] top-[20px] h-0.5 border-t border-dashed border-border/60 overflow-hidden">
          {!reduce && active && (
            <div
              className="h-full w-4 bg-[#8ab4f8] shadow-[0_0_8px_#8ab4f8] animate-dash relative"
              style={{ animation: "pf-dash-travel 2s linear infinite" }}
            />
          )}
        </div>

        {/* Target Node */}
        <div className="flex flex-col items-center gap-1.5 z-10">
          <div className="flex size-10 items-center justify-center rounded-xl border border-[#4285f4]/40 bg-[#4285f4]/10 shadow-[0_0_12px_rgba(66,133,244,0.15)] animate-pulse">
            <RefreshCw
              className={cn(
                "size-4.5 text-[#4285f4] dark:text-[#8ab4f8]",
                !reduce && active && "animate-spin"
              )}
              style={!reduce && active ? { animationDuration: "6s" } : {}}
            />
          </div>
          <span className="font-mono text-[9px] text-[#4285f4] dark:text-[#8ab4f8] font-semibold">
            doc2mcp server
          </span>
        </div>
      </div>

      {/* Sync Status Badge */}
      <div className="mt-4 inline-flex items-center gap-1.5 font-mono text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.8 rounded-full border border-emerald-500/20">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
        Synced · 2 mins ago
      </div>
    </div>
  );
}

/* -------------------------- 5. Multi-agent ----------------------------- */

const AGENTS = ["Cursor", "Claude", "VS Code", "Windsurf", "OpenAI"];

function MultiAgentCard({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [activeAgent, setActiveAgent] = useState(0);

  useEffect(() => {
    if (!active || reduce) {
      return;
    }
    const id = setInterval(() => {
      setActiveAgent((p) => (p + 1) % AGENTS.length);
    }, 1100);
    return () => clearInterval(id);
  }, [active, reduce]);

  return (
    <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
      {AGENTS.map((label, i) => {
        const hot = i === activeAgent && !reduce;
        return (
          <div
            className={cn(
              "flex flex-col gap-1.5 p-2 rounded-xl border transition-all duration-500 bg-card/40 backdrop-blur-md",
              hot
                ? "border-[#4285f4] bg-[#4285f4]/8 shadow-[0_0_12px_rgba(66,133,244,0.15)] scale-[1.03]"
                : "border-border/60 hover:border-border/80"
            )}
            key={label}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-foreground/95">
                {label}
              </span>
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  hot ? "bg-emerald-500 animate-pulse" : "bg-neutral-500/50"
                )}
              />
            </div>
            <span className="text-[8.5px] font-mono text-muted-foreground">
              {hot ? "connected" : "standby"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------- 6. Export ------------------------------- */

function ExportCard({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  // Periodic copy flash simulation
  useEffect(() => {
    if (!active || reduce) {
      return;
    }
    const id = setInterval(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }, 4500);
    return () => clearInterval(id);
  }, [active, reduce]);

  return (
    <div className="relative h-full min-h-[120px] w-full overflow-hidden rounded-2xl border border-border/40 bg-zinc-950/95 p-3.5 font-mono text-[10px] leading-relaxed shadow-inner">
      <div className="text-zinc-400 select-all">
        <span className="text-amber-500 font-bold">{"{"}</span>
        <br />
        <span className="text-sky-300"> &quot;mcpServers&quot;</span>:{" "}
        <span className="text-amber-500 font-bold">{"{"}</span>
        <br />
        <span className="text-sky-300"> &quot;stripe&quot;</span>:{" "}
        <span className="text-amber-500 font-bold">{"{"}</span>
        <br />
        <span className="text-sky-300"> &quot;url&quot;</span>:{" "}
        <span className="text-emerald-400">
          &quot;https://doc2mcp.site/api/mcp/st_3a1&quot;
        </span>
        ,
        <br />
        <span className="text-sky-300"> &quot;headers&quot;</span>:{" "}
        <span className="text-amber-500 font-bold">{"{"}</span>{" "}
        <span className="text-sky-300">&quot;Authorization&quot;</span>:{" "}
        <span className="text-emerald-400">&quot;Bearer st_…&quot;</span>{" "}
        <span className="text-amber-500 font-bold">{"}"}</span>
        <br />
        <span className="text-amber-500 font-bold"> {"}"}</span>
        <br />
        <span className="text-amber-500 font-bold"> {"}"}</span>
        <br />
        <span className="text-amber-500 font-bold">{"}"}</span>
      </div>
      <span
        className={cn(
          "absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[9px] uppercase tracking-wider transition-all duration-300 font-semibold",
          copied
            ? "scale-100 border-[#4285f4]/40 bg-[#4285f4]/15 text-[#4285f4] dark:text-[#8ab4f8] opacity-100 shadow-[0_0_8px_rgba(66,133,244,0.15)]"
            : "scale-95 border-border/50 bg-background/50 text-muted-foreground opacity-70 hover:opacity-100 hover:scale-100 cursor-pointer"
        )}
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? "copied!" : "copy"}
      </span>
    </div>
  );
}

/* ------------------------------ Card shell ----------------------------- */

type Feature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  span: string;
  accent: string;
  highlight?: boolean;
  render: (active: boolean) => React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    id: "crawler",
    title: "Smart Documentation Crawling",
    description:
      "Automatically understands documentation hierarchy and structure — Mintlify, Docusaurus, Swagger, GitBook, raw markdown.",
    icon: Network,
    span: "lg:col-span-3 lg:row-span-2",
    accent: "from-[#4285f4]/15 via-[#8ab4f8]/5 to-transparent",
    render: (a) => <CrawlingCard active={a} />,
  },
  {
    id: "mcp",
    title: "Production Ready MCP Generation",
    description:
      "Generate MCP servers without writing MCP code. Tools, workflows, auth, hosting — done.",
    icon: Workflow,
    span: "lg:col-span-3",
    accent: "from-[#4285f4]/15 via-[#8ab4f8]/5 to-transparent",
    render: (a) => <MCPGenCard active={a} />,
  },
  {
    id: "retrieval",
    title: "Agent Optimized Retrieval",
    description:
      "Improve AI coding accuracy and reduce hallucinations with semantic, schema-aware retrieval.",
    icon: Target,
    span: "lg:col-span-3",
    accent: "from-[#4285f4]/20 via-[#8ab4f8]/10 to-transparent",
    highlight: true,
    render: (a) => <RetrievalCard active={a} />,
  },
  {
    id: "sync",
    title: "Live Documentation Sync",
    description:
      "Keep documentation synchronized automatically — your MCP server tracks the source.",
    icon: RefreshCw,
    span: "lg:col-span-2",
    accent: "from-[#4285f4]/15 via-[#8ab4f8]/5 to-transparent",
    render: (a) => <SyncCard active={a} />,
  },
  {
    id: "agents",
    title: "Multi-Agent Compatibility",
    description:
      "Works across the modern MCP ecosystem — Cursor, Claude, VS Code, Windsurf, OpenAI Agents.",
    icon: Bot,
    span: "lg:col-span-2",
    accent: "from-[#4285f4]/15 via-[#8ab4f8]/5 to-transparent",
    render: (a) => <MultiAgentCard active={a} />,
  },
  {
    id: "export",
    title: "One Click Export",
    description:
      "Instant MCP configuration generation. Copy a JSON snippet, paste into your editor, done.",
    icon: Download,
    span: "lg:col-span-2",
    accent: "from-[#4285f4]/15 via-[#8ab4f8]/5 to-transparent",
    render: (a) => <ExportCard active={a} />,
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const Icon = feature.icon;

  return (
    <motion.div
      className={cn(
        "group relative col-span-1 overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[#4285f4]/8 hover:shadow-xl sm:p-7",
        feature.span,
        feature.highlight
          ? "border-[#4285f4]/45 bg-gradient-to-br from-[#4285f4]/12 via-card/50 to-[#8ab4f8]/12"
          : "border-border/60 bg-card/40 hover:border-[#4285f4]/50 dark:hover:border-[#8ab4f8]/50"
      )}
      ref={ref}
      variants={cardVariants}
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
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4285f4]/45 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
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

        <div className="text-foreground/70">{feature.render(inView)}</div>
      </div>
    </motion.div>
  );
}

/* ----------------------------- Background ------------------------------ */

function useMouseParallax(enabled: boolean): {
  ref: React.RefCallback<HTMLElement>;
  x: MotionValue<number>;
  y: MotionValue<number>;
} {
  const ref = useRef<HTMLElement | null>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 20 });
  const y = useSpring(rawY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const el = ref.current;
    if (!(enabled && el)) {
      return;
    }
    const handle = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 24);
      rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 24);
    };
    el.addEventListener("mousemove", handle);
    return () => el.removeEventListener("mousemove", handle);
  }, [enabled, rawX, rawY]);

  const setRef = useCallback((node: HTMLElement | null) => {
    ref.current = node;
  }, []);

  return { ref: setRef, x, y };
}

/* ------------------------------ Section -------------------------------- */

export function PlatformSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const { ref: sectionRef, x, y } = useMouseParallax(!reduce);

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24 lg:py-32"
      id="features"
      ref={sectionRef}
    >
      {/* animated gradient mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={
          reduce
            ? undefined
            : {
                background:
                  "radial-gradient(circle at 50% 50%, rgba(66, 133, 244, 0.12) 0%, rgba(66, 133, 244, 0.03) 60%, transparent 100%)",
                backgroundSize: "200% 200%",
                animation: "pf-mesh 18s ease-in-out infinite",
              }
        }
      />
      {/* parallax dot grid */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          x,
          y,
          backgroundImage:
            "radial-gradient(circle at center, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-12">
        <div
          className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-16 mb-12 sm:mb-16 text-left"
          ref={headerRef}
        >
          <div>
            <span className="mb-4 inline-flex items-center gap-3 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
              Platform
            </span>
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl leading-tight">
              {HEADING_WORDS.map((word, i) => {
                const gradient = word === "Every" || word === "layer";
                return (
                  <motion.span
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    className={cn(
                      "mr-[0.25em] inline-block",
                      gradient &&
                        "bg-gradient-to-r from-[#4285f4] to-[#8ab4f8] bg-clip-text text-transparent font-semibold"
                    )}
                    initial={{ opacity: 0, y: 14 }}
                    key={word}
                    transition={{ delay: reduce ? 0 : i * 0.07, duration: 0.5 }}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </h2>
          </div>
          <div className="flex flex-col justify-end lg:pb-1">
            <p className="text-base text-muted-foreground leading-relaxed">
              From crawl to retrieval to deployment — the full stack between
              your docs and an AI agent.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono text-[#4285f4] dark:text-[#8ab4f8]">
              <span className="flex items-center gap-1.5 border border-[#4285f4]/30 bg-[#4285f4]/5 px-2.5 py-1 rounded-full">
                <span className="size-1.5 rounded-full bg-[#4285f4] animate-pulse" />
                6 Capabilities
              </span>
              <span className="flex items-center gap-1.5 border border-[#8ab4f8]/30 bg-[#8ab4f8]/5 px-2.5 py-1 rounded-full">
                <span className="size-1.5 rounded-full bg-[#8ab4f8] animate-pulse" />
                1 Secure Endpoint
              </span>
            </div>
          </div>
        </div>

        <motion.div
          animate="show"
          className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-6 lg:auto-rows-[minmax(220px,auto)]"
          initial="hidden"
          variants={containerVariants}
          viewport={{ once: true, amount: 0.1 }}
          whileInView="show"
        >
          {FEATURES.map((feature) => (
            <FeatureCard feature={feature} key={feature.id} />
          ))}
        </motion.div>
      </div>

      <style>{`
        @keyframes pf-scan {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }
        @keyframes pf-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pf-bar {
          0%   { width: 0; }
          55%  { width: var(--pf-target); }
          100% { width: var(--pf-target); }
        }
        @keyframes pf-dash-travel {
          0%   { left: 0%; transform: translateX(-100%); }
          100% { left: 100%; transform: translateX(0%); }
        }
        @keyframes pf-glow {
          0%, 100% { box-shadow: 0 0 18px -6px rgba(66, 133, 244, 0.35); }
          50%      { box-shadow: 0 0 26px -4px rgba(138, 180, 248, 0.55); }
        }
        @keyframes pf-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pf-ripple {
          0%   { transform: scale(0.5); opacity: 0.7; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        @keyframes pf-mesh {
          0%, 100% { background-position: 0% 0%; }
          50%      { background-position: 100% 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="pf-"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
