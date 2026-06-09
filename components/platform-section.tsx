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
  Sparkles,
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
    }, 520);
    return () => clearInterval(id);
  }, [active, reduce]);

  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden rounded-xl border border-border/40 bg-background/40 p-3 backdrop-blur-xl sm:min-h-[300px]">
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
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          crawling
        </span>
      </div>

      <ul className="mt-2.5 space-y-1 font-mono text-[11px]">
        {CRAWLER_TREE.map((row, i) => {
          const done = i <= scanRow;
          const scanning = i === scanRow;
          return (
            <li
              className="relative flex items-center gap-1.5 overflow-hidden rounded transition-colors"
              key={row.label}
              style={{ paddingLeft: `${row.indent * 14}px` }}
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
                  "truncate transition-colors",
                  done ? "text-foreground/85" : "text-muted-foreground/60"
                )}
              >
                {row.label}
              </span>
              {scanning ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 left-0 bg-gradient-to-r from-transparent via-violet-400/25 to-transparent"
                  style={{ animation: "pf-scan 0.5s linear" }}
                />
              ) : null}
              <Check
                aria-hidden="true"
                className={cn(
                  "ml-auto size-3 shrink-0 text-emerald-500 transition-all duration-300",
                  done ? "scale-100 opacity-100" : "scale-50 opacity-0"
                )}
              />
            </li>
          );
        })}
      </ul>

      <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between border-border/30 border-t pt-2 font-mono text-[10px]">
        <span className="text-muted-foreground">pages indexed</span>
        <span className="font-display font-semibold text-foreground/85 text-sm tabular-nums">
          {count.toLocaleString()}
        </span>
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
    <div className="relative flex h-full min-h-[120px] w-full flex-col justify-center gap-2">
      {RETRIEVAL_ROWS.map((row, i) => {
        const top = i === 0;
        return (
          <div
            className={cn(
              "rounded-lg border bg-card/60 px-3 py-2 backdrop-blur-xl",
              top
                ? "border-fuchsia-500/40 shadow-[0_0_18px_-6px] shadow-fuchsia-500/40"
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
              <span className="font-mono text-foreground/85">{row.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[10px]",
                  top
                    ? "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300"
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
                    ? "bg-gradient-to-r from-fuchsia-500 to-violet-500"
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
  );
}

/* ------------------------------ 4. Sync -------------------------------- */

const ORBIT_ICONS = [
  { Icon: FileText, name: "file" },
  { Icon: Workflow, name: "workflow" },
  { Icon: Network, name: "network" },
  { Icon: Bot, name: "bot" },
];

function SyncCard({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative flex h-full min-h-[120px] w-full items-center justify-center">
      <div className="relative size-32">
        {/* ripple rings */}
        {!reduce && active
          ? [0, 1].map((ring) => (
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-emerald-500/30"
                key={`ring-${ring}`}
                style={{
                  animation: "pf-ripple 2.6s ease-out infinite",
                  animationDelay: `${ring * 1.3}s`,
                }}
              />
            ))
          : null}

        {/* orbiting doc icons */}
        <div
          className="absolute inset-0"
          style={
            reduce ? undefined : { animation: "pf-orbit 9s linear infinite" }
          }
        >
          {ORBIT_ICONS.map(({ Icon, name }, i) => {
            const angle = (i / ORBIT_ICONS.length) * 2 * Math.PI;
            const r = 56;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            return (
              <span
                className="absolute flex size-7 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-foreground/70"
                key={name}
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <Icon className="size-3.5" />
              </span>
            );
          })}
        </div>

        {/* center */}
        <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex size-12 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10">
          <RefreshCw
            className="size-5 text-emerald-500"
            style={
              reduce ? undefined : { animation: "spin 4s linear infinite" }
            }
          />
        </span>
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
    <div className="relative flex h-full min-h-[120px] w-full flex-wrap items-center justify-center gap-2">
      {AGENTS.map((label, i) => {
        const hot = i === activeAgent && !reduce;
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-xl transition-all duration-500",
              hot
                ? "scale-105 border-violet-500/50 bg-violet-500/15 text-violet-700 shadow-[0_0_16px_-4px] shadow-violet-500/50 dark:text-violet-200"
                : "border-border/60 bg-card/60 text-foreground/75"
            )}
            key={label}
            style={
              reduce
                ? undefined
                : {
                    animation: "pf-fade-in 0.5s ease-out both",
                    animationDelay: `${i * 0.12}s`,
                  }
            }
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                hot ? "bg-violet-500" : "bg-emerald-500"
              )}
            />
            {label}
          </span>
        );
      })}
    </div>
  );
}

/* ----------------------------- 6. Export ------------------------------- */

const EXPORT_JSON = `{
  "mcpServers": {
    "stripe": {
      "url": "https://doc2mcp.site/…",
      "headers": { "Authorization": "Bearer …" }
    }
  }
}`;

function ExportCard({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [chars, setChars] = useState(reduce ? EXPORT_JSON.length : 0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!active || reduce) {
      setChars(EXPORT_JSON.length);
      return;
    }
    let n = 0;
    const type = setInterval(() => {
      n += 2;
      if (n >= EXPORT_JSON.length) {
        n = EXPORT_JSON.length;
        clearInterval(type);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
      setChars(n);
    }, 36);
    return () => clearInterval(type);
  }, [active, reduce]);

  // Re-trigger the copy flash periodically once typed out.
  useEffect(() => {
    if (!active || reduce) {
      return;
    }
    const id = setInterval(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }, 4000);
    return () => clearInterval(id);
  }, [active, reduce]);

  return (
    <div className="relative h-full min-h-[120px] w-full overflow-hidden rounded-xl border border-border/40 bg-zinc-950/90 p-3 font-mono text-[10px] text-zinc-300 backdrop-blur-xl">
      <pre className="whitespace-pre">{EXPORT_JSON.slice(0, chars)}</pre>
      <span
        className={cn(
          "absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[9px] uppercase tracking-wider transition-all duration-300",
          copied
            ? "scale-100 border-emerald-500/40 bg-emerald-500/15 text-emerald-300 opacity-100"
            : "scale-90 border-border/50 bg-background/40 text-muted-foreground opacity-70"
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
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"
          ref={headerRef}
        >
          <span className="mb-5 inline-flex items-center gap-3 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
            <span className="h-px w-8 bg-foreground/30" />
            Platform
            <span className="h-px w-8 bg-foreground/30" />
          </span>
          <h2 className="font-display text-3xl tracking-tight sm:text-5xl lg:text-6xl">
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
          <p className="mt-5 text-base text-muted-foreground leading-relaxed sm:text-lg">
            From crawl to retrieval to deployment — the full stack between your
            docs and an AI agent.
          </p>
          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-[#4285f4]/30 bg-[#4285f4]/10 px-3 py-1 font-mono text-[10px] text-[#4285f4] dark:text-[#8ab4f8] uppercase tracking-[0.16em]">
            <Sparkles aria-hidden="true" className="size-3" />6 capabilities · 1
            endpoint
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
