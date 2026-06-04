"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Paste documentation URL",
    description:
      "Drop any docs URL — Stripe, LangChain, or your private portal. Simple entry, no local setup.",
    code: `https://docs.stripe.com
https://docs.langchain.com

# doc2mcp parsing triggered`,
  },
  {
    number: "02",
    title: "Automatic crawling",
    description:
      "Scrapes pages, articles, API endpoints, and github trees while preserving all code block blocks and structures.",
    code: `discovered: 1,284 pages
api_routes: 312
sdk_refs:   148
code_blocks: 2,406`,
  },
  {
    number: "03",
    title: "Knowledge structuring",
    description:
      "Transforms unstructured docs into clean semantic chunks and metadata indexes optimized for agent retrieval.",
    code: `chunks      → 4,182
schemas     → 312
embeddings  → 4,182 × 1536
retrieval   → ASI1 Engine`,
  },
  {
    number: "04",
    title: "MCP generation",
    description:
      "Publishes a secure, hosted Model Context Protocol server exposing customized query tools and schemas.",
    code: `tools:     23
workflows: 6
endpoint:  https://doc2mcp.site/api/mcp/<id>
auth:      bearer token`,
  },
  {
    number: "05",
    title: "Connect anywhere",
    description:
      "Add the generated endpoint credentials into Cursor, Claude Desktop, Windsurf, or VS Code settings.",
    code: `{
  "mcpServers": {
    "stripe": {
      "url": "https://doc2mcp.site/api/mcp/<id>/mcp",
      "headers": {
        "Authorization": "Bearer <token>"
      }
    }
  }
}`,
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative overflow-hidden bg-background py-20 sm:py-28"
      id="how-it-works"
      ref={sectionRef}
    >
      {/* Background Subtle Gradient */}
      <div 
        className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full pointer-events-none opacity-15 dark:opacity-10 blur-[100px]"
        style={{
          background: "radial-gradient(circle, rgba(66, 133, 244, 0.1) 0%, transparent 100%)"
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        {/* Header */}
        <div
          className={`mb-12 transition-all duration-700 sm:mb-16 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <span className="font-mono text-muted-foreground/60 text-xs sm:text-sm tracking-wider uppercase">
            HOW IT WORKS
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Documentation in.
            <br />
            AI context out.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground text-sm leading-relaxed">
            Five steps to go from a public documentation URL to an auto-synced, hosted MCP server running in your workspace.
          </p>
        </div>

        {/* Dynamic Walkthrough Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16 items-center">
          
          {/* Step Selector List */}
          <div className="space-y-2">
            {steps.map((step, index) => (
              <button
                className={cn(
                  "w-full rounded-2xl p-4 text-left transition-all duration-300 flex gap-4 border",
                  activeStep === index
                    ? "bg-card border-border/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
                    : "bg-transparent border-transparent hover:bg-card/45 hover:border-border/30"
                )}
                key={step.number}
                onClick={() => setActiveStep(index)}
                type="button"
              >
                <span className={cn(
                  "font-mono text-sm shrink-0 flex items-center justify-center size-8 rounded-full font-semibold",
                  activeStep === index 
                    ? "bg-[#4285f4] dark:bg-[#8ab4f8] text-white dark:text-[#131314]"
                    : "bg-secondary text-muted-foreground"
                )}>
                  {step.number}
                </span>
                <div>
                  <h3 className="font-display font-medium text-foreground text-base sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-md">
                    {step.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Step Preview Box */}
          <div
            className={cn(
              "transition-all duration-500 lg:sticky lg:top-28 lg:self-center",
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
          >
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              {/* Chrome headers */}
              <div className="flex items-center gap-1.5 border-border/40 border-b px-4 py-3 bg-secondary/35">
                <span className="size-2 rounded-full bg-[#4285f4]" />
                <span className="size-2 rounded-full bg-[#8ab4f8]" />
                <span className="size-2 rounded-full bg-border" />
                <span className="ml-2 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                  step {steps[activeStep].number} · {steps[activeStep].title.toLowerCase()}
                </span>
              </div>
              
              {/* Pre code */}
              <pre className="overflow-x-auto p-5 font-mono text-foreground/80 text-[11px] sm:text-xs leading-relaxed bg-card">
                {steps[activeStep].code}
              </pre>
            </div>

            {/* Clients Row */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-muted-foreground mr-1">Integrates with:</span>
              {["Cursor", "Claude", "VS Code", "Windsurf", "AI SDK"].map((t) => (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 font-mono text-[9px] text-muted-foreground uppercase tracking-wider"
                  key={t}
                >
                  <span className="size-1.5 rounded-full bg-[#4285f4]" />
                  {t}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
