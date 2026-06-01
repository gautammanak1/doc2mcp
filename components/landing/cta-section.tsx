"use client";

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

      <div className="relative mx-auto flex max-w-[820px] flex-col items-center px-4 text-center sm:px-6 lg:px-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-[11px] text-violet-700 uppercase tracking-wider dark:text-violet-200">
          <Sparkles className="size-3" />
          Ship in minutes
        </span>
        <h2 className="mt-5 font-display text-3xl tracking-tight sm:text-5xl lg:text-6xl">
          Make your documentation{" "}
          <span className="bg-gradient-to-r from-sky-400 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            AI-native.
          </span>
        </h2>
        <p className="mt-5 max-w-xl text-muted-foreground leading-relaxed sm:text-lg">
          Stop building MCP servers manually. Generate AI-ready infrastructure
          directly from documentation — and let every agent your team uses speak
          the same language.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            asChild
            className="group h-12 w-full gap-2 rounded-full bg-foreground px-7 text-background hover:bg-foreground/90 sm:w-auto"
            size="lg"
          >
            <Link href="/chat">
              Generate MCP
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            className="h-12 w-full rounded-full sm:w-auto"
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

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[11px] text-muted-foreground">
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
    </section>
  );
}
