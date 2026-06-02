"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { InstallTargets } from "@/lib/marketplace/install";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
      onClick={handleCopy}
      type="button"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          {label}
        </>
      )}
    </button>
  );
}

function ConfigBlock({ json }: { json: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/50 bg-background/60">
      <pre className="overflow-x-auto px-3 py-2.5 font-mono text-[11.5px] text-foreground/85 leading-relaxed">
        <code>{json}</code>
      </pre>
    </div>
  );
}

function CursorIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Cursor</title>
      <path
        d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function VscodeIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>VS Code</title>
      <path
        d="m17 3-7 6.5L5.5 6 3 7.5 7 12l-4 4.5L5.5 18l4.5-3.5L17 21l4-2V5l-4-2Zm0 4.2v9.6L11.5 12 17 7.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function InstallPanel({ targets }: { targets: InstallTargets }) {
  return (
    <section className="mt-12">
      <h2 className="font-display font-semibold text-foreground text-xl tracking-tight">
        Install
      </h2>
      <p className="mt-1 text-muted-foreground text-sm">
        One click adds this MCP server to your editor. Works with Cursor and VS
        Code.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {/* Cursor */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/40 p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg border border-border/50 bg-background text-foreground">
              <CursorIcon className="size-4" />
            </span>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Cursor</h3>
              <p className="text-[12px] text-muted-foreground">
                Adds to Settings → MCP
              </p>
            </div>
          </div>

          <Button asChild className="group h-10 w-full gap-1.5 rounded-full">
            <a href={targets.cursorDeeplink}>
              <Download className="size-4" />
              Install in Cursor
            </a>
          </Button>

          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">
              Or paste into{" "}
              <code className="font-mono">~/.cursor/mcp.json</code>
            </span>
            <CopyButton label="Copy config" value={targets.cursorConfigJson} />
          </div>
          <ConfigBlock json={targets.cursorConfigJson} />
        </div>

        {/* VS Code */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/40 p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg border border-border/50 bg-background text-[#0098FF]">
              <VscodeIcon className="size-4" />
            </span>
            <div>
              <h3 className="font-semibold text-foreground text-sm">VS Code</h3>
              <p className="text-[12px] text-muted-foreground">
                Opens the MCP install prompt
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="h-10 flex-1 gap-1.5 rounded-full">
              <a href={targets.vscodeDeeplink}>
                <Download className="size-4" />
                Install in VS Code
              </a>
            </Button>
            <Button
              asChild
              className="h-10 flex-1 gap-1.5 rounded-full"
              variant="outline"
            >
              <a href={targets.vscodeInsidersDeeplink}>Insiders</a>
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">
              Or paste into <code className="font-mono">.vscode/mcp.json</code>
            </span>
            <CopyButton label="Copy config" value={targets.vscodeConfigJson} />
          </div>
          <ConfigBlock json={targets.vscodeConfigJson} />
        </div>
      </div>

      <p className="mt-3 text-[12px] text-muted-foreground">
        Endpoint:{" "}
        <code className="font-mono text-foreground/80">
          {targets.endpointUrl}
        </code>
      </p>
    </section>
  );
}
