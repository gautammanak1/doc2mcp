"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Server,
  Sparkles,
  Wand2,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const VALUE_TILES = [
  {
    icon: Wand2,
    title: "Paste any docs URL",
    body: "Mintlify, Docusaurus, GitBook, OpenAPI, Markdown, raw HTML — auto-detected.",
  },
  {
    icon: Workflow,
    title: "Get semantic toolkits + workflows",
    body: "Endpoints compressed into named tools and grouped into agent-ready workflows.",
  },
  {
    icon: Server,
    title: "Ship a hosted remote MCP",
    body: "One-line config for Cursor, Claude, Windsurf, Cline, VS Code — no install.",
  },
];

const FOOTNOTES = [
  { icon: CheckCircle2, label: "Free forever tier" },
  { icon: Clock, label: "< 60s to first MCP" },
  { icon: Sparkles, label: "ASI1 under the hood" },
];

export function CtaSection() {
  return (
    <section className="relative border-border/40 border-t py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="-top-32 -translate-x-1/2 pointer-events-none absolute left-1/2 size-[640px] rounded-full bg-violet-500/10 blur-[140px]"
      />

      <div className="relative mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-[11px] text-violet-700 uppercase tracking-wider dark:text-violet-200">
              <Sparkles className="size-3" />
              Start in seconds
            </span>
            <h2 className="mt-5 font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
              Your docs are the API.{" "}
              <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                Let your agents read them.
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
              No more pasting screenshots into chat. No more brittle scrapers.
              Drop a URL, get a hosted MCP server your Cursor, Claude, or
              Windsurf agents can call directly.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="group h-12 gap-2 rounded-full bg-foreground px-7 text-background hover:bg-foreground/90"
                size="lg"
              >
                <Link href="/chat">
                  Generate my first MCP
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                className="h-12 rounded-full"
                size="lg"
                variant="outline"
              >
                <Link href="/docs/getting-started">Read the 2-min guide</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-muted-foreground">
              {FOOTNOTES.map((note) => {
                const Icon = note.icon;
                return (
                  <span className="flex items-center gap-1.5" key={note.label}>
                    <Icon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    {note.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {VALUE_TILES.map((tile, index) => {
              const Icon = tile.icon;
              return (
                <div
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-xl transition-colors hover:border-border"
                  key={tile.title}
                >
                  <div
                    aria-hidden="true"
                    className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-0 font-mono text-[80px] text-foreground/[0.04] leading-none"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="relative flex items-start gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/15 text-violet-700 ring-1 ring-violet-500/30 dark:text-violet-200">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-base">
                        {tile.title}
                      </p>
                      <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                        {tile.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 grid gap-3 rounded-2xl border border-border/40 bg-card/40 p-5 backdrop-blur-xl sm:grid-cols-4">
          <div className="sm:col-span-1">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Ready in one paste
            </p>
            <p className="mt-1 font-display font-semibold text-base">
              ~/.cursor/mcp.json
            </p>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-border/50 bg-background/70 p-4 font-mono text-[11px] leading-relaxed text-foreground/80 sm:col-span-3">
            {`{
  "mcpServers": {
    "stripe-docs": {
      "url": "https://doc2mcp.com/mcp/stripe-docs",
      "headers": { "Authorization": "Bearer <project-token>" }
    }
  }
}`}
          </pre>
        </div>
      </div>
    </section>
  );
}
