"use client";

import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { startTransition, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { AnimatedSphere } from "./animated-sphere";

const words = ["AI-ready", "agent-native", "MCP-shaped", "production"];

const marqueeStats = [
  { value: "<60s", label: "docs to MCP", company: "PIPELINE" },
  { value: "1 URL", label: "paste & go", company: "INPUT" },
  { value: "No install", label: "remote MCP", company: "HOSTED" },
  { value: "Cursor", label: "ready config", company: "EXPORT" },
];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    startTransition(() => setIsVisible(true));
    const interval = setInterval(
      () => setWordIndex((prev) => (prev + 1) % words.length),
      2500
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-32">
      <div className="pointer-events-none absolute right-[-25%] top-1/2 hidden size-[480px] -translate-y-1/2 opacity-25 md:block lg:right-[-10%] lg:size-[640px] lg:opacity-35">
        <AnimatedSphere />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.07]">
        {Array.from({ length: 8 }, (_, i) => i).map((i) => (
          <div
            className="absolute right-0 left-0 h-px bg-foreground"
            key={`hero-line-${String(i)}`}
            style={{ top: `${12.5 * (i + 1)}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-12 lg:pb-28">
        <div
          className={`mb-6 transition-all duration-700 sm:mb-8 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <span className="inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-card/40 px-3.5 py-1.5 font-mono text-[10px] text-muted-foreground backdrop-blur-xl sm:text-xs">
            <Sparkles aria-hidden="true" className="size-3 text-violet-500" />
            The infrastructure layer for AI-ready docs
          </span>
        </div>

        <h1
          className={`max-w-none font-display text-[clamp(2rem,8vw,7rem)] leading-[1.02] tracking-tight transition-all duration-1000 sm:max-w-[18ch] sm:leading-[0.98] ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span className="block">Turn any docs into</span>
          <span className="block">
            <span className="relative inline-block">
              <span className="inline-flex" key={wordIndex}>
                {words[wordIndex].split("").map((char, i) => (
                  <span
                    className="animate-char-in inline-block bg-gradient-to-br from-sky-400 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent"
                    key={`${wordIndex}-${char}-${String(i)}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            </span>{" "}
            <span className="text-foreground/90">MCP servers.</span>
          </span>
        </h1>

        <p
          className={`mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground transition-all delay-200 duration-700 sm:mt-8 sm:text-lg lg:text-xl ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Give Cursor, Claude, Windsurf, VS Code, and OpenAI agents instant
          access to your documentation. Paste a docs URL and get a hosted,
          production-ready MCP server — in minutes.
        </p>

        <div
          className={`mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4 transition-all delay-300 duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
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
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Works with Cursor, Claude Desktop, VS Code, Windsurf, OpenAI Agents
          and every MCP-compatible tool.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 lg:grid-cols-4">
          {marqueeStats.map((stat) => (
            <div
              className="rounded-xl border border-border/40 bg-card/30 px-4 py-4 backdrop-blur-xl"
              key={stat.company}
            >
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
