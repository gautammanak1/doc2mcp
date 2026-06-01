"use client";

import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { startTransition, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { HeroWorkflowVisual } from "./hero-workflow-visual";

const words = [
  "AI Infrastructure",
  "Agent Context",
  "MCP Tooling",
  "Knowledge",
];

const marqueeStats = [
  { value: "<60s", label: "docs → MCP", company: "PIPELINE" },
  { value: "1 URL", label: "paste & go", company: "INPUT" },
  { value: "Hosted", label: "no install", company: "REMOTE" },
  { value: "5+", label: "MCP clients", company: "EXPORTS" },
];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    startTransition(() => setIsVisible(true));
    const interval = setInterval(
      () => setWordIndex((prev) => (prev + 1) % words.length),
      2800
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-32">
      {/* Background grid + radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklab, currentColor 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, currentColor 7%, transparent) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse at center top, black 30%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center top, black 30%, transparent 85%)",
          }}
        />
        <div className="absolute top-[-10%] left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-[140px] dark:bg-violet-500/25" />
        <div className="absolute top-1/4 right-[-5%] size-[420px] rounded-full bg-sky-500/15 blur-[120px]" />
        <div className="absolute bottom-0 left-[-5%] size-[420px] rounded-full bg-fuchsia-500/15 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-12 lg:pb-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <div
              className={`mb-6 transition-all duration-700 sm:mb-8 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <span className="inline-flex items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 font-mono text-[10px] text-violet-700 backdrop-blur-xl sm:text-xs dark:text-violet-200">
                <Sparkles aria-hidden="true" className="size-3" />
                Documentation infrastructure for AI agents
              </span>
            </div>

            <h1
              className={`max-w-none font-display text-[clamp(2.25rem,7.5vw,5.75rem)] leading-[1.02] tracking-tight transition-all duration-1000 sm:leading-[0.98] ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              <span className="block">Turn Documentation</span>
              <span className="block">
                Into{" "}
                <span className="relative inline-block">
                  <span className="inline-flex" key={wordIndex}>
                    {words[wordIndex].split("").map((char, i) => (
                      <span
                        className="animate-char-in inline-block bg-gradient-to-br from-sky-400 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent"
                        key={`${wordIndex}-${char}-${String(i)}`}
                        style={{
                          animationDelay: `${i * 35}ms`,
                          whiteSpace: char === " " ? "pre" : "normal",
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </h1>

            <p
              className={`mt-6 max-w-xl text-base leading-relaxed text-muted-foreground transition-all delay-200 duration-700 sm:mt-7 sm:text-lg ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              Give Cursor, Claude, OpenAI Agents, Windsurf, and AI systems
              instant access to your APIs, SDKs, and product documentation.
              Paste a docs URL and generate a production-ready MCP server in
              minutes.
            </p>

            <div
              className={`mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4 transition-all delay-300 duration-700 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <Button
                asChild
                className="group h-12 w-full rounded-full bg-foreground px-7 text-background hover:bg-foreground/90 sm:w-auto"
                size="lg"
              >
                <Link href="/chat">
                  Generate MCP
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                className="h-12 w-full rounded-full border-foreground/20 px-7 hover:bg-foreground/5 sm:w-auto"
                size="lg"
                variant="outline"
              >
                <a
                  href="https://calendly.com/doc2mcp/30min"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Calendar aria-hidden="true" className="mr-2 size-4" />
                  Book demo
                </a>
              </Button>
            </div>

            <p
              className={`mt-5 text-muted-foreground text-xs transition-all delay-500 duration-700 sm:text-sm ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              Works with Cursor, Claude Desktop, VS Code, Windsurf, OpenAI
              Agents and every MCP-compatible tool.
            </p>
          </div>

          {/* Animated workflow — desktop only */}
          <div
            className={`relative mx-auto hidden h-[460px] w-full max-w-[460px] lg:block xl:h-[520px] transition-all duration-1000 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <HeroWorkflowVisual />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 lg:grid-cols-4">
          {marqueeStats.map((stat, i) => (
            <div
              className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/30 px-4 py-4 backdrop-blur-xl transition-colors hover:border-border"
              key={stat.company}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <p className="font-display font-semibold text-2xl tracking-tight sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">{stat.label}</p>
              <p className="mt-3 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                {stat.company}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
