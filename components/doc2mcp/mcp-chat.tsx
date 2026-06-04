"use client";

import { ArrowUp, Bot, ExternalLink, Loader2, User } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Source = { title: string; url: string };

type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
  pending?: boolean;
};

const SUGGESTIONS = [
  "What is this documentation about?",
  "How do I authenticate?",
  "Show me a quick start example",
];

export function McpChat({
  projectId,
  token,
}: {
  projectId: string;
  token: string;
}) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    const pendingTurn: ChatTurn = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "",
      pending: true,
    };
    setTurns((prev) => [...prev, userTurn, pendingTurn]);
    setInput("");
    setBusy(true);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });

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
          turn.id === pendingTurn.id
            ? {
                ...turn,
                pending: false,
                text: res.ok
                  ? (data.answer ?? "No answer returned.")
                  : `Request failed: ${data.error ?? res.status}`,
                sources: res.ok ? data.sources : undefined,
              }
            : turn
        )
      );
    } catch {
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === pendingTurn.id
            ? {
                ...turn,
                pending: false,
                text: "Network error — please try again.",
              }
            : turn
        )
      );
    } finally {
      setBusy(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  };

  return (
    <div className="flex h-[460px] flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex-1 space-y-4 overflow-y-auto p-4" ref={scrollRef}>
        {turns.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <span className="flex size-10 items-center justify-center rounded-full border border-border bg-muted">
              <Bot className="size-5 text-muted-foreground" />
            </span>
            <div>
              <p className="font-medium text-sm">Chat with your MCP</p>
              <p className="mt-1 text-muted-foreground text-xs">
                Ask anything — answers come straight from your crawled docs.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  className="rounded-full border border-border px-3 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-foreground"
                  key={s}
                  onClick={() => ask(s)}
                  type="button"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          turns.map((turn) => <ChatBubble key={turn.id} turn={turn} />)
        )}
      </div>

      <form
        className="flex items-center gap-2 border-border border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your documentation…"
          value={input}
        />
        <Button
          className="size-8 shrink-0 rounded-full p-0"
          disabled={busy || !input.trim()}
          size="sm"
          type="submit"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowUp className="size-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

function ChatBubble({ turn }: { turn: ChatTurn }) {
  const isUser = turn.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border",
          isUser
            ? "border-border bg-muted"
            : "border-violet-500/30 bg-violet-500/10 text-violet-500 dark:text-violet-300"
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </span>
      <div
        className={cn(
          "min-w-0 max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-muted/40"
        )}
      >
        {turn.pending ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Thinking…
          </span>
        ) : (
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {turn.text}
          </p>
        )}
        {turn.sources && turn.sources.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5 border-border/60 border-t pt-2.5">
            {turn.sources.map((source) => (
              <a
                className="inline-flex max-w-[200px] items-center gap-1 truncate rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
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
        ) : null}
      </div>
    </div>
  );
}
