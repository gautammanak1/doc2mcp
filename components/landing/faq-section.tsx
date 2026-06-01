"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Faq = {
  id: string;
  q: string;
  a: string;
};

const FAQS: Faq[] = [
  {
    id: "what-is-mcp",
    q: "What is MCP?",
    a: "The Model Context Protocol is an open standard from Anthropic that lets AI agents (Cursor, Claude Desktop, Windsurf, OpenAI Agents) discover and call tools over a uniform JSON-RPC interface. doc2mcp produces fully compliant MCP servers your agents can connect to with a URL + Bearer token.",
  },
  {
    id: "how-it-works",
    q: "How does doc2mcp work?",
    a: "Paste a documentation URL. We crawl the site (Mintlify, Docusaurus, Swagger, GitBook, plain HTML — all supported), preserve code blocks, run an ASI1 understanding pass that detects auth, workflows, and endpoint groups, and generate a hosted MCP server with semantic tools — typically in under 60 seconds.",
  },
  {
    id: "supported-clients",
    q: "Which AI tools are supported?",
    a: "Anything that speaks MCP — Cursor, Claude Desktop, VS Code, Windsurf, OpenAI Agents, Cline, Zed, and the broader MCP client ecosystem. We provide ready-to-paste config snippets for every major client in your project dashboard.",
  },
  {
    id: "private-docs",
    q: "Can I use private documentation?",
    a: "Yes. Pro and Team plans support private projects with authenticated crawling and per-MCP Bearer tokens. Enterprise customers can self-host doc2mcp inside their VPC with SSO, RBAC, and audit logging — your docs and tokens never leave your perimeter.",
  },
  {
    id: "updates",
    q: "How often are docs updated?",
    a: "Free plans run on-demand refreshes. Pro plans auto-resync every 24h, Team plans every 6h, and Enterprise plans support webhook-triggered instant updates. We use content-hash diffing so only changed pages get re-crawled.",
  },
  {
    id: "self-host",
    q: "Can enterprises self-host?",
    a: "Yes. We offer fully self-hosted deployments on AWS, GCP, or Azure with bring-your-own-key encryption, SSO via SAML/OIDC, audit logs, and custom retention policies. Reach out via the contact form to start a security review.",
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0]?.id ?? null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
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
      className="relative overflow-hidden py-20 sm:py-28 lg:py-32"
      id="faq"
      ref={sectionRef}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/8 blur-[120px] dark:bg-violet-500/15" />
      </div>

      <div className="relative mx-auto max-w-[860px] px-4 sm:px-6 lg:px-12">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 font-mono text-muted-foreground text-xs uppercase tracking-[0.18em] sm:text-sm">
            <span className="h-px w-8 bg-foreground/30" />
            FAQ
            <span className="h-px w-8 bg-foreground/30" />
          </span>
          <h2
            className={cn(
              "mt-5 font-display text-3xl tracking-tight transition-all duration-700 sm:text-5xl lg:text-6xl",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            )}
          >
            Questions, answered.
          </h2>
          <p className="mt-4 text-muted-foreground sm:text-lg">
            Everything builders ask before shipping with doc2mcp.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:mt-14">
          {FAQS.map((faq, i) => {
            const isOpen = openId === faq.id;
            return (
              <div
                className={cn(
                  "overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl transition-all duration-500",
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0",
                  isOpen ? "border-border" : "hover:border-border/80"
                )}
                key={faq.id}
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <button
                  aria-controls={`faq-panel-${faq.id}`}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  type="button"
                >
                  <span className="font-display font-semibold text-base sm:text-lg">
                    {faq.q}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
                      isOpen ? "rotate-180" : "rotate-0"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  )}
                  id={`faq-panel-${faq.id}`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed sm:px-6 sm:pb-6 sm:text-base">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-muted-foreground text-sm">
          Still curious?{" "}
          <a
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
            href="https://calendly.com/doc2mcp/30min"
            rel="noopener noreferrer"
            target="_blank"
          >
            Talk to the founders →
          </a>
        </p>
      </div>
    </section>
  );
}
