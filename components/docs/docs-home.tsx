import {
  ArrowRight,
  Boxes,
  Compass,
  FlaskConical,
  Plug,
  Rocket,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CARDS = [
  {
    href: "/docs/what-is-doc2mcp",
    title: "What is doc2mcp?",
    body: "Understand the product and the documentation-to-agent pipeline in two minutes.",
    icon: Compass,
  },
  {
    href: "/docs/quickstart",
    title: "Quick start",
    body: "Generate your first MCP server from any docs URL — no install, no API keys.",
    icon: Rocket,
  },
  {
    href: "/docs/first-mcp",
    title: "First MCP in 5 minutes",
    body: "A guided walkthrough from a pasted URL to a working server in Cursor.",
    icon: Terminal,
  },
  {
    href: "/docs/crawling",
    title: "Core concepts",
    body: "Crawling, knowledge processing, retrieval, MCP generation, and compatibility.",
    icon: Boxes,
  },
  {
    href: "/docs/connect-cursor",
    title: "Connect your tools",
    body: "Wire your MCP into Cursor, Claude, VS Code, Windsurf, and OpenAI Agents.",
    icon: Plug,
  },
  {
    href: "/docs/example-stripe",
    title: "Examples",
    body: "End-to-end conversions of Stripe, Supabase, and GitHub documentation.",
    icon: FlaskConical,
  },
] as const;

export function DocsHome() {
  return (
    <div>
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-accent/40 to-transparent px-6 py-12 sm:px-10 sm:py-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] text-primary uppercase tracking-wider">
          <ShieldCheck className="size-3" />
          Documentation
        </span>
        <h1 className="mt-5 max-w-2xl font-display font-semibold text-4xl tracking-tight sm:text-5xl">
          Documentation for AI infrastructure
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Learn how to transform documentation into AI-ready MCP infrastructure
          for Cursor, Claude, OpenAI Agents, and modern AI systems.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
            href="/docs/quickstart"
          >
            Quick start
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-6 font-medium text-sm transition-colors hover:bg-accent"
            href="/docs/first-mcp"
          >
            Create your first MCP
          </Link>
        </div>
      </section>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border/60">
        <Image
          alt="The doc2mcp pipeline: documentation, crawling, knowledge processing, retrieval, MCP generation, AI agents"
          className="w-full"
          height={260}
          src="/diagrams/pipeline.svg"
          unoptimized
          width={1280}
        />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {CARDS.map((card) => (
          <Link
            className="group flex flex-col rounded-2xl border border-border/60 p-5 transition-colors hover:border-border hover:bg-accent/40"
            href={card.href}
            key={card.href}
          >
            <span className="flex size-9 items-center justify-center rounded-lg border border-border/60 bg-accent/60 text-primary">
              <card.icon className="size-4" />
            </span>
            <h3 className="mt-4 flex items-center gap-1 font-medium">
              {card.title}
              <ArrowRight className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </h3>
            <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
              {card.body}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
