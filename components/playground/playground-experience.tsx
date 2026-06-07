"use client";

import { ArrowUp, Code2, Loader2, Terminal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { PixelText } from "@/components/playground/pixel-text";
import { Button } from "@/components/ui/button";

const URL_PATTERN = /https?:\/\/[^\s]+/i;

function extractUrl(value: string): string | null {
  const match = value.match(URL_PATTERN);
  return match ? match[0] : null;
}

function buildCliSnippet(url: string): string {
  return [
    "# Install the doc2mcp CLI",
    "npm install -g doc2mcp",
    "",
    "# Authorize once (opens your browser)",
    "doc2mcp login",
    "",
    "# Convert docs into a hosted MCP server",
    `doc2mcp ${url}`,
  ].join("\n");
}

function buildConfigSnippet(): string {
  return JSON.stringify(
    {
      mcpServers: {
        doc2mcp: {
          url: "https://doc2mcp.site/api/mcp/<projectId>/mcp",
          headers: { Authorization: "Bearer <project-token>" },
        },
      },
    },
    null,
    2
  );
}

export function PlaygroundExperience() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snippetOpen, setSnippetOpen] = useState(false);

  const detectedUrl = useMemo(() => extractUrl(value), [value]);
  const snippetUrl = detectedUrl ?? "https://docs.example.com";

  const startConversion = useCallback(async () => {
    const url = extractUrl(value);
    if (!url) {
      toast.error("Paste a documentation URL (https://…)");
      return;
    }

    setIsSubmitting(true);
    const pending = toast.loading("Starting doc2mcp pipeline…", {
      description: "crawl → analyze → generate MCP",
    });

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: url }),
      });

      if (res.status === 401) {
        toast.dismiss(pending);
        toast.error("Sign in to generate an MCP server");
        router.push(`/login?redirectUrl=${encodeURIComponent("/playground")}`);
        return;
      }

      if (!res.ok) {
        toast.dismiss(pending);
        let message = "Could not start conversion";
        try {
          const body = (await res.json()) as { message?: string };
          if (body.message) {
            message = body.message;
          }
        } catch {
          // keep default message
        }
        toast.error(message);
        return;
      }

      const body = (await res.json()) as { id: string };
      toast.dismiss(pending);
      router.push(`/convert/${body.id}`);
    } catch {
      toast.dismiss(pending);
      toast.error("Network error — please try again");
    } finally {
      setIsSubmitting(false);
    }
  }, [router, value]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!isSubmitting) {
          startConversion();
        }
      }
    },
    [isSubmitting, startConversion]
  );

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#050505] px-4 text-zinc-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "4px 4px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black"
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-10">
        <div
          className="flex flex-col items-center gap-3"
          style={
            {
              "--pixel-size": "clamp(6px, 1.6vw, 11px)",
              "--pixel-gap": "1px",
            } as React.CSSProperties
          }
        >
          <PixelText text="DOC2MCP" />
          <PixelText text="PLAYGROUND" />
        </div>

        <div className="w-full rounded-2xl border border-white/10 bg-zinc-900/70 p-4 shadow-2xl backdrop-blur-sm">
          <label className="sr-only" htmlFor="playground-prompt">
            What would you like the agent to do?
          </label>
          <textarea
            className="min-h-[52px] w-full resize-none bg-transparent px-2 py-1 text-base text-zinc-100 outline-none placeholder:text-zinc-500"
            id="playground-prompt"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="What would you like the agent to do?"
            rows={2}
            value={value}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <Button
              className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-zinc-100"
              onClick={() => setSnippetOpen(true)}
              type="button"
              variant="outline"
            >
              <Code2 className="size-4" />
              Get Code Snippet
            </Button>

            <Button
              className="bg-zinc-100 text-zinc-900 hover:bg-white disabled:opacity-40"
              disabled={isSubmitting || !detectedUrl}
              onClick={() => startConversion()}
              type="button"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" />
              )}
              Send
            </Button>
          </div>
        </div>

        <p className="max-w-md text-center text-sm text-zinc-500">
          Paste any documentation URL — Stripe, Anthropic, your own — and the
          agent crawls it into a hosted, token-secured MCP server your editor
          can call.
        </p>
      </div>

      {snippetOpen ? (
        <CodeSnippetOverlay
          cli={buildCliSnippet(snippetUrl)}
          config={buildConfigSnippet()}
          onClose={() => setSnippetOpen(false)}
        />
      ) : null}
    </main>
  );
}

function CodeSnippetOverlay({
  cli,
  config,
  onClose,
}: {
  cli: string;
  config: string;
  onClose: () => void;
}) {
  const copy = useCallback((text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied`))
      .catch(() => toast.error("Copy failed"));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-white/10 border-b px-5 py-3.5">
          <p className="flex items-center gap-2 font-mono text-xs text-zinc-400 uppercase tracking-[0.16em]">
            <Terminal className="size-3.5" />
            doc2mcp snippet
          </p>
          <Button
            aria-label="Close"
            className="text-zinc-400 hover:text-zinc-100"
            onClick={onClose}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium text-sm text-zinc-300">CLI</p>
              <Button
                className="text-zinc-400 hover:text-zinc-100"
                onClick={() => copy(cli, "CLI snippet")}
                size="xs"
                type="button"
                variant="ghost"
              >
                Copy
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-[12.5px] text-emerald-300/90 leading-relaxed">
              {cli}
            </pre>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium text-sm text-zinc-300">
                Editor config (mcp.json)
              </p>
              <Button
                className="text-zinc-400 hover:text-zinc-100"
                onClick={() => copy(config, "Config")}
                size="xs"
                type="button"
                variant="ghost"
              >
                Copy
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-[12.5px] text-sky-300/90 leading-relaxed">
              {config}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
