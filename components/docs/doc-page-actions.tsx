"use client";

import { ArrowLeft, ArrowRight, Check, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { DocNavItem } from "@/lib/docs/loader";
import { cn } from "@/lib/utils";

export function DocPageActions({
  markdown,
  prev,
  next,
}: {
  markdown: string;
  prev: DocNavItem | null;
  next: DocNavItem | null;
}) {
  const [copied, setCopied] = useState(false);

  const copyPage = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/60 bg-background px-2.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent/60 hover:text-foreground"
        onClick={copyPage}
        type="button"
      >
        {copied ? (
          <Check className="size-3.5 text-primary" />
        ) : (
          <Copy className="size-3.5" />
        )}
        {copied ? "Copied" : "Copy Page"}
      </button>
      <DocArrow item={prev} label="Previous page">
        <ArrowLeft className="size-3.5" />
      </DocArrow>
      <DocArrow item={next} label="Next page">
        <ArrowRight className="size-3.5" />
      </DocArrow>
    </div>
  );
}

function DocArrow({
  item,
  label,
  children,
}: {
  item: DocNavItem | null;
  label: string;
  children: React.ReactNode;
}) {
  const base =
    "inline-flex size-8 items-center justify-center rounded-md border border-border/60 transition-colors";

  if (!item) {
    return (
      <span
        aria-disabled="true"
        className={cn(base, "cursor-not-allowed text-muted-foreground/40")}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      aria-label={`${label}: ${item.title}`}
      className={cn(
        base,
        "bg-background text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      )}
      href={item.href}
    >
      {children}
    </Link>
  );
}
