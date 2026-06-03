"use client";

import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { Streamdown } from "streamdown";

const docPlugins = { cjk, code, math };

export function DocContent({ content }: { content: string }) {
  return (
    <article
      className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/85 prose-li:text-foreground/85 prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:rounded-md prose-code:border prose-code:border-border/60 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-medium prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-border/60 prose-pre:bg-muted prose-pre:text-foreground dark:prose-pre:bg-black/40 prose-blockquote:border-l-primary/60 prose-blockquote:text-foreground/80 prose-hr:border-border/60 prose-th:text-foreground prose-td:text-foreground/85"
      id="doc-article"
    >
      <Streamdown plugins={docPlugins}>{content}</Streamdown>
    </article>
  );
}
