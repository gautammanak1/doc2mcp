"use client";

import { ArrowUp, ExternalLink, FileSearch, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MessageResponse } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Source = { title: string; url: string };

type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
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

const WORK_STAGES = [
  "Searching your documentation…",
  "Reading the most relevant pages…",
  "Writing the answer…",
] as const;

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
  const [stage, setStage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  // Cycle the "what the MCP is doing" status while a request is in flight so
  // the panel feels alive like Cursor's tool steps.
  useEffect(() => {
    if (!busy) {
      setStage(0);
      return;
    }
    const timer = setInterval(() => {
      setStage((s) => Math.min(s + 1, WORK_STAGES.length - 1));
    }, 1100);
    return () => clearInterval(timer);
  }, [busy]);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || busy) {
      return;
    }

    const userTurn: ChatTurn = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };
    const pendingId = crypto.randomUUID();
    setTurns((prev) => [
      ...prev,
      userTurn,
      { id: pendingId, role: "assistant", text: "", pending: true },
    ]);
    setInput("");
    setBusy(true);
    scrollToBottom();

    try {
      const res = await fetch(`/api/mcp/${projectId}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Doc2MCP-Token": token,
        },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = (await res.json()) as {
        answer?: string;
        sources?: Source[];
        error?: string;
      };
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === pendingId
            ? {
                ...turn,
                pending: false,
                failed: !res.ok,
                text: res.ok
                  ? (data.answer ?? "I couldn't find an answer in the docs.")
                  : `The MCP returned an error: ${data.error ?? res.status}`,
                sources: res.ok ? data.sources : undefined,
              }
            : turn
        )
      );
    } catch {
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === pendingId
            ? {
                ...turn,
                pending: false,
                failed: true,
                text: "Network error reaching the MCP — please try again.",
              }
            : turn
        )
      );
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
    <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-card/60 shadow-sm backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-border/70 border-b bg-background/40 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
            <Sparkles className="size-3.5" />
          </span>
          <div className="leading-tight">
            <p className="font-medium text-sm">MCP assistant</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              live · answers from your crawled docs
              {typeof pageCount === "number" ? ` · ${pageCount} pages` : ""}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-600 uppercase tracking-wider dark:text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          connected
        </span>
      </div>

      {/* Messages */}
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
                Ask anything — the MCP searches your crawled pages and answers
                with sources, just like Cursor or Claude would.
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
          turns.map((turn) => (
            <ChatBubble
              key={turn.id}
              stageText={WORK_STAGES[stage]}
              turn={turn}
            />
          ))
        )}
      </div>

      {/* Composer */}
      <div className="border-border/70 border-t bg-background/40 p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/15">
          <textarea
            aria-label="Ask your documentation"
            className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask your documentation anything…"
            ref={textareaRef}
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

function ChatBubble({
  turn,
  stageText,
}: {
  turn: ChatTurn;
  stageText: string;
}) {
  const isUser = turn.role === "user";

  if (isUser) {
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
      <div className="min-w-0 flex-1">
        {turn.pending ? (
          <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-md border border-border bg-muted/40 px-4 py-3">
            <span className="flex gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-violet-400" />
            </span>
            <span className="text-muted-foreground text-sm">{stageText}</span>
          </div>
        ) : (
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
                  Sources · via search_documentation
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
