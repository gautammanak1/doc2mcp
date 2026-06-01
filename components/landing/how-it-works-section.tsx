"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "I",
    title: "Paste docs URL",
    description:
      "Open chat, enable the doc2mcp toggle, and paste any docs URL — LangChain, Stripe, Agentverse, your own.",
    code: `https://docs.langchain.com
https://docs.stripe.com

# doc2mcp toggle ON in chat`,
  },
  {
    number: "II",
    title: "ASI1 reads the docs",
    description:
      "Deep crawl → preserve code blocks → compress endpoints into semantic AI tools.",
    code: `create_customer()
list_orders()

# Not: POST /v1/customers`,
  },
  {
    number: "III",
    title: "Plug remote MCP into Cursor",
    description:
      "Get a URL + Bearer token. No local install, no third-party API keys.",
    code: `{
  "mcpServers": {
    "langchain": {
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
            Docs URL → MCP
            <br />
            in three steps
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <button
                className={`w-full border p-4 text-left transition-all sm:p-6 ${
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
                <h3 className="mt-2 font-medium text-lg sm:text-xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-background/60 text-sm leading-relaxed">
                  {step.description}
                </p>
              </button>
            ))}
          </div>

          <div
            className={`transition-all duration-500 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <pre className="overflow-x-auto border border-background/20 bg-background/5 p-4 font-mono text-background/80 text-xs leading-relaxed sm:p-6 sm:text-sm">
              {steps[activeStep].code}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
