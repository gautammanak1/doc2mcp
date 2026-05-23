"use client";

import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { Streamdown } from "streamdown";

const docPlugins = { cjk, code, math, mermaid };

export function DocContent({ content }: { content: string }) {
  return (
    <article className="prose prose-invert prose-headings:font-display max-w-none prose-a:text-primary prose-code:rounded-md prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-pre:bg-black/50">
      <Streamdown plugins={docPlugins}>{content}</Streamdown>
    </article>
  );
}
