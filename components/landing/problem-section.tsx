"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  ClipboardX,
  Clock,
  Ghost,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const PAIN_POINTS = [
  {
    icon: Clock,
    title: "Hours lost in docs",
    body: "Developers waste 5–10 hours every week hunting through outdated, fragmented documentation that lives across 4–6 different sites.",
    accent: "from-rose-500/30 to-orange-500/30",
  },
  {
    icon: Ghost,
    title: "AI agents hallucinate",
    body: "When Cursor / Claude / ChatGPT don't have current API context, they invent endpoints, mis-spell params, and ship code that compiles but breaks in production.",
    accent: "from-violet-500/30 to-fuchsia-500/30",
  },
  {
    icon: ClipboardX,
    title: "Copy-paste, every time",
    body: "Engineers paste the same docs section into prompts over and over. Knowledge stays trapped in chat history, not in your IDE.",
    accent: "from-sky-500/30 to-cyan-500/30",
  },
  {
    icon: AlertTriangle,
    title: "Version drift",
    body: "v1 says one thing, v2 the opposite, the changelog disagrees with both. Your AI assistant picks the wrong one — silently.",
    accent: "from-amber-500/30 to-yellow-500/30",
  },
];

const TICKER_LINES = [
  "> ai: i'll use `client.users.create(...)` — that method doesn't exist anymore",
  "> deprecated in v2.4 — see /migration-guide-3 (404)",
  "> stackoverflow answer is 4 years old, half the params changed",
  "> spent 47 minutes finding one endpoint in 6 different doc sites",
  "> changelog says v3 is breaking — no migration example",
  "> prod incident: AI hallucinated a webhook signature header",
];

/**
 * The "Problem" section frames the pain doc2mcp solves *before* introducing
 * the product. Pure narrative — no "buy our thing" CTAs — with motion that
 * mirrors the chaos described.
 */
export function ProblemSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [tick, setTick] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      return;
    }
    const id = setInterval(() => setTick((t) => t + 1), 2400);
    return () => clearInterval(id);
  }, [reduce]);

  const activeLine = TICKER_LINES[tick % TICKER_LINES.length];

  return (
    <section
      className="relative overflow-hidden border-border/30 border-y bg-background py-20 sm:py-28 lg:py-36"
      id="problem"
      ref={ref}
    >
      <Backdrop />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 lg:px-12">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.4 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="inline-flex items-center gap-3 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
            <span className="h-px w-8 bg-foreground/30" />
            The problem
            <span className="h-px w-8 bg-foreground/30" />
          </span>
          <h2 className="mt-6 font-display text-3xl tracking-tight sm:text-5xl lg:text-6xl">
            Docs are{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-rose-600 dark:text-rose-400">
                broken
              </span>
              <motion.span
                animate={{ scaleX: 1 }}
                aria-hidden="true"
                className="-bottom-1 -z-0 absolute right-0 left-0 h-2.5 origin-left rounded-sm bg-rose-500/20"
                initial={{ scaleX: 0 }}
                transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
                whileInView={{ scaleX: 1 }}
              />
            </span>{" "}
            for AI agents.
          </h2>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed sm:text-lg">
            Documentation was written for humans, not models. So your AI
            assistant guesses, hallucinates, or stalls — and you pay the bill in
            lost hours and prod incidents.
          </p>
        </motion.div>

        <div className="mt-16 grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {/* Visual: the chaos image with floating glitch chips */}
          <motion.div
            className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/60 bg-black"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
          >
            <Image
              alt="Glass cards labelled 404 Page Not Found, Deprecated, Version Mismatch, Needle in Haystack and Missing Examples orbiting a glowing orb representing an exhausted developer"
              className="size-full object-cover"
              fill={true}
              sizes="(min-width: 1024px) 640px, 90vw"
              src="/landing/problem-docs-v2.png"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-violet-500/10"
            />

            {/* Floating glitch chips overlayed on the image */}
            <FloatingChip className="top-6 left-6" delay={0.4} tone="rose">
              404 doc not found
            </FloatingChip>
            <FloatingChip className="top-12 right-8" delay={0.7} tone="amber">
              deprecated in v2.4
            </FloatingChip>
            <FloatingChip
              className="bottom-20 left-10"
              delay={1.0}
              tone="violet"
            >
              missing example
            </FloatingChip>
            <FloatingChip className="bottom-8 right-10" delay={1.3} tone="cyan">
              needle in a haystack
            </FloatingChip>

            {/* Scanline */}
            {!reduce && (
              <motion.div
                animate={{ y: ["-10%", "110%"] }}
                aria-hidden="true"
                className="pointer-events-none absolute right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400/40 to-transparent"
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            )}

            {/* Live "wrong AI output" ticker */}
            <div className="absolute right-4 bottom-4 left-4 rounded-xl border border-rose-500/30 bg-black/80 p-3 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Bot className="size-3.5 text-rose-400" />
                <p className="font-mono text-[10px] text-rose-300/90 uppercase tracking-wider">
                  AI hallucinating · live
                </p>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="size-1.5 animate-pulse rounded-full bg-rose-400" />
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 truncate font-mono text-[12px] text-rose-100/90"
                  exit={{ opacity: 0, y: -4 }}
                  initial={{ opacity: 0, y: 6 }}
                  key={activeLine}
                  transition={{ duration: 0.35 }}
                >
                  {activeLine}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Pain points list with staggered reveal */}
          <motion.ul
            className="space-y-3"
            initial="hidden"
            transition={{ staggerChildren: 0.12, delayChildren: 0.15 }}
            viewport={{ once: true, amount: 0.2 }}
            whileInView="visible"
          >
            {PAIN_POINTS.map((pt) => {
              const Icon = pt.icon;
              return (
                <motion.li
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-5 backdrop-blur-xl transition-colors hover:border-border"
                  key={pt.title}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <div
                    aria-hidden="true"
                    className={`-translate-y-1/2 pointer-events-none absolute top-1/2 right-0 size-32 translate-x-1/4 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${pt.accent}`}
                  />
                  <div className="relative flex items-start gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/80 ring-1 ring-border/50">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-base text-foreground">
                        {pt.title}
                      </p>
                      <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                        {pt.body}
                      </p>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        {/* Bottom: short subtle "what changes when AI gets real context" tease */}
        <motion.div
          className="mx-auto mt-16 flex max-w-2xl items-center justify-center gap-2 text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1 }}
        >
          <Sparkles className="size-3.5 text-violet-500" />
          <span>
            What if your AI assistant actually knew every endpoint, version, and
            example?
          </span>
        </motion.div>
      </div>
    </section>
  );
}

function FloatingChip({
  children,
  className,
  delay,
  tone,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
  tone: "rose" | "amber" | "violet" | "cyan";
}) {
  const reduce = useReducedMotion();
  const toneClass = {
    rose: "border-rose-500/40 bg-rose-500/15 text-rose-100",
    amber: "border-amber-500/40 bg-amber-500/15 text-amber-100",
    violet: "border-violet-500/40 bg-violet-500/15 text-violet-100",
    cyan: "border-cyan-500/40 bg-cyan-500/15 text-cyan-100",
  }[tone];

  return (
    <motion.span
      animate={
        reduce
          ? { opacity: 1, y: 0 }
          : { opacity: [0, 1, 1, 0.85], y: [-4, 0, 0, -2] }
      }
      className={`absolute inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md ${toneClass} ${className ?? ""}`}
      initial={{ opacity: 0, y: -8 }}
      transition={{
        duration: 4.5,
        delay,
        repeat: reduce ? 0 : Number.POSITIVE_INFINITY,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      <span className="size-1 rounded-full bg-current opacity-60" />
      {children}
    </motion.span>
  );
}

function Backdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="-top-32 -translate-x-1/2 pointer-events-none absolute left-1/2 size-[640px] rounded-full bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </>
  );
}
