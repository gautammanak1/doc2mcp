"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "I",
    title: "Paste documentation URL",
    description:
      "Drop any docs URL — Stripe, LangChain, your private docs portal. One input, no setup.",
    code: `https://docs.stripe.com
https://docs.langchain.com

# doc2mcp toggle ON in chat`,
  },
  {
    number: "II",
    title: "Automatic crawling",
    description:
      "Discovers APIs, guides, SDK references, and examples — preserving structure and code blocks.",
    code: `discovered: 1,284 pages
api_routes: 312
sdk_refs:   148
code_blocks: 2,406`,
  },
  {
    number: "III",
    title: "Knowledge structuring",
    description:
      "Transforms content into AI-optimized context — semantic chunks, schemas, and retrieval-ready embeddings.",
    code: `chunks      → 4,182
schemas     → 312
embeddings  → 4,182 × 1536
retrieval   → ASI1`,
  },
  {
    number: "IV",
    title: "MCP generation",
    description:
      "Creates production-ready MCP infrastructure — tools, workflows, and a remote endpoint, fully hosted.",
    code: `tools:     23
workflows: 6
endpoint:  hosted (remote MCP)
auth:      bearer token`,
  },
  {
    number: "V",
    title: "Connect anywhere",
    description:
      "Plug the same MCP server into Cursor, Claude Desktop, VS Code, Windsurf, or OpenAI Agents.",
    code: `{
  "mcpServers": {
    "stripe": {
      "url": "https://your-doc2mcp.app/api/mcp/<id>/mcp",
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
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative overflow-hidden bg-foreground py-16 text-background sm:py-24 lg:py-32"
      id="how-it-works"
      ref={sectionRef}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)",
            backgroundSize: "12px 12px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 lg:px-12">
        <div
          className={`mb-12 transition-all duration-700 sm:mb-16 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span className="font-mono text-background/50 text-xs sm:text-sm">
            HOW IT WORKS
          </span>
          <h2 className="mt-4 font-display text-3xl tracking-tight sm:text-5xl lg:text-6xl">
            Documentation in.
            <br />
            AI infrastructure out.
          </h2>
          <p className="mt-5 max-w-2xl text-background/60 text-sm leading-relaxed sm:text-base">
            Five steps from a URL to a production-ready MCP server, plugged into
            your agent of choice.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-3">
            {steps.map((step, index) => (
              <button
                className={`w-full border p-4 text-left transition-all sm:p-5 ${
                  activeStep === index
                    ? "border-background/30 bg-background/10"
                    : "border-background/10 hover:border-background/20"
                }`}
                key={step.number}
                onClick={() => setActiveStep(index)}
                type="button"
              >
                <span className="font-mono text-background/40 text-xs">
                  {step.number}
                </span>
                <h3 className="mt-2 font-medium text-base sm:text-lg">
                  {step.title}
                </h3>
                <p className="mt-2 text-background/60 text-sm leading-relaxed">
                  {step.description}
                </p>
              </button>
            ))}
          </div>

          <div
            className={`transition-all duration-500 lg:sticky lg:top-24 lg:self-start ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-md border border-background/20 bg-background/5 backdrop-blur-xl">
              <div className="flex items-center gap-2 border-background/10 border-b px-4 py-2.5">
                <span className="size-2 rounded-full bg-rose-400/50" />
                <span className="size-2 rounded-full bg-amber-400/50" />
                <span className="size-2 rounded-full bg-emerald-400/50" />
                <span className="ml-2 font-mono text-[10px] text-background/40 uppercase tracking-wider">
                  step {steps[activeStep].number} ·{" "}
                  {steps[activeStep].title.toLowerCase()}
                </span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-background/80 text-xs leading-relaxed sm:p-6 sm:text-sm">
                {steps[activeStep].code}
              </pre>
            </div>

            {/* Connect targets chip row */}
            <div className="mt-4 flex flex-wrap gap-2">
              {["Cursor", "Claude", "VS Code", "Windsurf", "OpenAI Agents"].map(
                (t) => (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-background/20 bg-background/5 px-3 py-1 font-mono text-[10px] text-background/70 uppercase tracking-wider"
                    key={t}
                  >
                    <span className="size-1.5 rounded-full bg-emerald-400/70" />
                    {t}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
