"use client";

import {
  ArrowUp,
  Check,
  ChevronRight,
  ExternalLink,
  FileSearch,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { MessageResponse } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Source = { title: string; url: string };

type ToolStep = {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  status: "running" | "done" | "error";
  summary?: string;
  raw?: string;
};

type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  steps: ToolStep[];
  sources?: Source[];
  pending?: boolean;
  failed?: boolean;
};

const SUGGESTIONS = [
  "Summarize what this documentation covers",
  "How do I authenticate?",
  "Show me a quick start example",
  "What endpoints are available?",
];

type McpToolResponse = {
  isError: boolean;
  text: string;
  parsed: Record<string, unknown> | null;
};

type StreamAskHandlers = {
  onSources: (sources: Source[]) => void;
  onDelta: (delta: string) => void;
};

async function callMcpTool(
  projectId: string,
  token: string,
  name: string,
  args: Record<string, unknown>
): Promise<McpToolResponse> {
  const res = await fetch(`/api/mcp/${projectId}/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Doc2MCP-Token": token,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: name,
      method: "tools/call",
      params: { name, arguments: args },
    }),
  });
  const json = (await res.json()) as {
    result?: {
      content?: Array<{ text?: string }>;
      isError?: boolean;
    };
    error?: { message?: string };
  };
  if (json.error) {
    throw new Error(json.error.message ?? "Tool call failed");
  }
  const text = json.result?.content?.[0]?.text ?? "";
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    parsed = null;
  }
  return { isError: Boolean(json.result?.isError), text, parsed };
}

async function streamAskDocumentation(
  projectId: string,
  token: string,
  question: string,
  handlers: StreamAskHandlers
): Promise<void> {
  const res = await fetch(`/api/mcp/${projectId}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Doc2MCP-Token": token,
    },
    body: JSON.stringify({ question, stream: true }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Streaming failed (${res.status})`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("Streaming response did not include a body.");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame
        .split("\n")
        .find((entry) => entry.trim().startsWith("data:"));
      if (!line) {
        continue;
      }

      const payload = line.slice(line.indexOf("data:") + 5).trim();
      if (!payload) {
        continue;
      }

      const data = JSON.parse(payload) as
        | { type: "sources"; sources: Source[] }
        | { type: "delta"; delta: string }
        | { type: "done" }
        | { type: "error"; message: string };

      if (data.type === "sources") {
        handlers.onSources(data.sources);
      } else if (data.type === "delta") {
        handlers.onDelta(data.delta);
      } else if (data.type === "error") {
        throw new Error(data.message);
      }
    }
  }
}

export function McpChat({
  projectId,
  token,
  pageCount,
}: {
  projectId: string;
  token: string;
  pageCount?: number;
}) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const patchTurn = (id: string, fn: (turn: ChatTurn) => ChatTurn) => {
    setTurns((prev) => prev.map((turn) => (turn.id === id ? fn(turn) : turn)));
  };

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || busy) {
      return;
    }

    const assistantId = crypto.randomUUID();
    const listStepId = crypto.randomUUID();
    const searchStepId = crypto.randomUUID();
    const askStepId = crypto.randomUUID();

    setTurns((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: trimmed, steps: [] },
      {
        id: assistantId,
        role: "assistant",
        text: "",
        pending: true,
        steps: [
          {
            id: listStepId,
            tool: "list_documentation_pages",
            args: {},
            status: "running",
          },
          {
            id: searchStepId,
            tool: "search_documentation",
            args: { query: trimmed, limit: 6 },
            status: "running",
          },
        ],
      },
    ]);
    setInput("");
    setBusy(true);
    scrollToBottom();

    try {
      // Step 1 — real MCP tool call: discover the indexed docs first.
      const pages = await callMcpTool(
        projectId,
        token,
        "list_documentation_pages",
        {}
      );
      const total =
        typeof pages.parsed?.total === "number" ? pages.parsed.total : null;
      patchTurn(assistantId, (turn) => ({
        ...turn,
        steps: turn.steps.map((step) =>
          step.id === listStepId
            ? {
                ...step,
                status: pages.isError ? "error" : "done",
                summary:
                  total === null ? "index loaded" : `${total} pages indexed`,
                raw: pages.text.slice(0, 4000),
              }
            : step
        ),
      }));
      scrollToBottom();

      // Step 2 — real MCP tool call: semantic search over crawled docs.
      const search = await callMcpTool(
        projectId,
        token,
        "search_documentation",
        {
          query: trimmed,
          limit: 6,
        }
      );
      const results = Array.isArray(search.parsed?.results)
        ? (search.parsed?.results as unknown[])
        : [];
      patchTurn(assistantId, (turn) => ({
        ...turn,
        steps: turn.steps.map((step) =>
          step.id === searchStepId
            ? {
                ...step,
                status: search.isError ? "error" : "done",
                summary: search.isError
                  ? "search failed"
                  : `${results.length} sections matched`,
                raw: search.text.slice(0, 4000),
              }
            : step
        ),
      }));
      scrollToBottom();

      // Step 3 — streaming grounded answer. The UI keeps this as an
      // ask_documentation tool step so users see the same flow as Cursor:
      // tool call starts, tokens stream, then the tool completes.
      patchTurn(assistantId, (turn) => ({
        ...turn,
        steps: [
          ...turn.steps,
          {
            id: askStepId,
            tool: "ask_documentation",
            args: { question: trimmed },
            status: "running",
          },
        ],
      }));
      scrollToBottom();

      await streamAskDocumentation(projectId, token, trimmed, {
        onSources: (sources) => {
          patchTurn(assistantId, (turn) => ({ ...turn, sources }));
        },
        onDelta: (delta) => {
          patchTurn(assistantId, (turn) => ({
            ...turn,
            text: `${turn.text}${delta}`,
          }));
          scrollToBottom();
        },
      });

      patchTurn(assistantId, (turn) => ({
        ...turn,
        pending: false,
        steps: turn.steps.map((step) =>
          step.id === askStepId
            ? { ...step, status: "done", summary: "stream complete" }
            : step
        ),
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      patchTurn(assistantId, (turn) => ({
        ...turn,
        pending: false,
        failed: true,
        text: `The MCP returned an error: ${message}`,
        steps: turn.steps.map((step) =>
          step.status === "running" ? { ...step, status: "error" } : step
        ),
      }));
    } finally {
      setBusy(false);
      scrollToBottom();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask(input);
    }
  };

  return (
    <div className="flex h-[580px] flex-col overflow-hidden rounded-2xl border border-border bg-card/60 shadow-sm backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 border-border/70 border-b bg-background/40 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
            <Sparkles className="size-3.5" />
          </span>
          <div className="leading-tight">
            <p className="font-medium text-sm">MCP assistant</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              live · calls your MCP tools
              {typeof pageCount === "number" ? ` · ${pageCount} pages` : ""}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-600 uppercase tracking-wider dark:text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          connected
        </span>
      </div>

      <div
        className="flex-1 space-y-5 overflow-y-auto px-4 py-5"
        ref={scrollRef}
      >
        {turns.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 text-violet-500 ring-1 ring-violet-500/20 dark:text-violet-300">
              <Sparkles className="size-6" />
            </span>
            <div className="max-w-sm">
              <p className="font-medium">Chat with your documentation</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Every question runs real MCP tool calls
                (list_documentation_pages → search_documentation →
                ask_documentation) and streams a cited answer — just like
                Cursor.
              </p>
            </div>
            <div className="flex w-full max-w-md flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2.5 text-left text-sm transition-colors hover:border-violet-500/40 hover:bg-accent"
                  key={s}
                  onClick={() => ask(s)}
                  type="button"
                >
                  <FileSearch className="size-4 shrink-0 text-muted-foreground" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          turns.map((turn) => <ChatBubble key={turn.id} turn={turn} />)
        )}
      </div>

      <div className="border-border/70 border-t bg-background/40 p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/15">
          <textarea
            aria-label="Ask your documentation"
            className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask your documentation anything…"
            rows={1}
            value={input}
          />
          <Button
            className="size-8 shrink-0 rounded-lg p-0"
            disabled={busy || !input.trim()}
            onClick={() => ask(input)}
            size="sm"
            type="button"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
        <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}

function ToolStepRow({ step }: { step: ToolStep }) {
  const argSummary = Object.entries(step.args)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(", ");

  return (
    <details className="group rounded-lg border border-border bg-background/70">
      <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs">
        <span className="shrink-0">
          {step.status === "running" ? (
            <Loader2 className="size-3.5 animate-spin text-violet-500" />
          ) : step.status === "error" ? (
            <X className="size-3.5 text-red-500" />
          ) : (
            <Check className="size-3.5 text-emerald-500" />
          )}
        </span>
        <span className="font-mono text-foreground">{step.tool}</span>
        <span className="truncate font-mono text-muted-foreground">
          ({argSummary})
        </span>
        {step.summary ? (
          <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
            {step.summary}
          </span>
        ) : null}
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
      </summary>
      {step.raw ? (
        <pre className="max-h-44 overflow-auto border-border/60 border-t p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
          {step.raw}
        </pre>
      ) : null}
    </details>
  );
}

function ChatBubble({ turn }: { turn: ChatTurn }) {
  if (turn.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground text-sm">
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {turn.text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
        <Sparkles className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        {turn.steps.length > 0 ? (
          <div className="space-y-1.5">
            {turn.steps.map((step) => (
              <ToolStepRow key={step.id} step={step} />
            ))}
          </div>
        ) : null}

        {turn.pending && !turn.text ? null : (
          <div
            className={cn(
              "rounded-2xl rounded-tl-md border px-4 py-3",
              turn.failed
                ? "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-300"
                : "border-border bg-muted/40"
            )}
          >
            <div className="prose-sm max-w-none text-sm leading-relaxed">
              <MessageResponse>{turn.text}</MessageResponse>
            </div>
            {turn.sources && turn.sources.length > 0 ? (
              <div className="mt-3 border-border/60 border-t pt-2.5">
                <p className="mb-1.5 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  Sources
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {turn.sources.map((source) => (
                    <a
                      className="inline-flex max-w-[220px] items-center gap-1 truncate rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                      href={source.url}
                      key={source.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="truncate">{source.title}</span>
                      <ExternalLink className="size-2.5 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
