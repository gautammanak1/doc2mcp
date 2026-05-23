"use client";

import { Loader2, Play, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ToolKey =
  | "list_documentation_pages"
  | "get_documentation_page"
  | "search_documentation"
  | "get_documentation_overview"
  | "read_full_documentation"
  | "ask_documentation";

type ToolDef = {
  key: ToolKey;
  label: string;
  description: string;
  defaultArgs: Record<string, unknown>;
};

const TOOLS: ToolDef[] = [
  {
    key: "list_documentation_pages",
    label: "list_documentation_pages",
    description: "Index of every page crawled.",
    defaultArgs: {},
  },
  {
    key: "search_documentation",
    label: "search_documentation",
    description: "Keyword search across all pages.",
    defaultArgs: { query: "authentication" },
  },
  {
    key: "get_documentation_page",
    label: "get_documentation_page",
    description: "Full text of one page by url or id.",
    defaultArgs: { url: "" },
  },
  {
    key: "get_documentation_overview",
    label: "get_documentation_overview",
    description: "Summary + llms.txt index for agents.",
    defaultArgs: {},
  },
  {
    key: "read_full_documentation",
    label: "read_full_documentation",
    description: "All pages combined as markdown.",
    defaultArgs: { maxPages: 5 },
  },
  {
    key: "ask_documentation",
    label: "ask_documentation",
    description: "Natural-language Q&A powered by doc2mcp AI.",
    defaultArgs: { question: "How do I authenticate?" },
  },
];

async function callMcp(
  projectId: string,
  token: string,
  tool: ToolKey,
  args: Record<string, unknown>
): Promise<unknown> {
  const headers: HeadersInit = {
    "X-Doc2MCP-Token": token,
    "Content-Type": "application/json",
  };

  if (tool === "list_documentation_pages") {
    const res = await fetch(`/api/mcp/${projectId}/pages`, { headers });
    return res.json();
  }
  if (tool === "get_documentation_page") {
    const ref = String(args.url ?? args.id ?? "");
    const res = await fetch(
      `/api/mcp/${projectId}/pages?ref=${encodeURIComponent(ref)}`,
      { headers }
    );
    return res.json();
  }
  if (tool === "search_documentation") {
    const q = encodeURIComponent(String(args.query ?? ""));
    const res = await fetch(`/api/mcp/${projectId}/search?q=${q}`, {
      headers,
    });
    return res.json();
  }
  if (tool === "get_documentation_overview") {
    const res = await fetch(`/api/mcp/${projectId}/overview`, { headers });
    return res.json();
  }
  if (tool === "read_full_documentation") {
    const max = args.maxPages
      ? `?maxPages=${encodeURIComponent(String(args.maxPages))}`
      : "";
    const res = await fetch(`/api/mcp/${projectId}/full${max}`, { headers });
    return res.json();
  }
  const res = await fetch(`/api/mcp/${projectId}/ask`, {
    method: "POST",
    headers,
    body: JSON.stringify({ question: String(args.question ?? "") }),
  });
  return res.json();
}

export type McpPlaygroundProps = {
  projectId: string;
  token: string;
};

export function McpPlayground({ projectId, token }: McpPlaygroundProps) {
  const [selected, setSelected] = useState<ToolKey>("list_documentation_pages");
  const [args, setArgs] = useState<string>(
    JSON.stringify(TOOLS[0]?.defaultArgs ?? {}, null, 2)
  );
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const tool = useMemo(
    () => TOOLS.find((t) => t.key === selected) ?? TOOLS[0],
    [selected]
  );

  const setExample = (key: ToolKey) => {
    setSelected(key);
    const def = TOOLS.find((t) => t.key === key);
    setArgs(JSON.stringify(def?.defaultArgs ?? {}, null, 2));
    setOutput(null);
  };

  const runTool = async () => {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = args.trim() ? (JSON.parse(args) as Record<string, unknown>) : {};
    } catch {
      setOutput(JSON.stringify({ error: "Invalid JSON arguments" }, null, 2));
      return;
    }

    setIsRunning(true);
    setOutput(null);
    try {
      const data = await callMcp(projectId, token, selected, parsed);
      setOutput(JSON.stringify(data, null, 2));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Request failed";
      setOutput(JSON.stringify({ error: message }, null, 2));
      toast.error("Tool call failed");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="grid gap-4 rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-xl lg:grid-cols-[260px_1fr]">
      <div className="flex flex-col gap-1">
        <p className="mb-2 font-mono text-muted-foreground text-xs uppercase tracking-wider">
          tools
        </p>
        {TOOLS.map((t) => (
          <button
            className={`rounded-lg border px-3 py-2 text-left font-mono text-xs transition-colors ${
              selected === t.key
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
            key={t.key}
            onClick={() => setExample(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <p className="font-medium text-sm">{tool.label}</p>
          <p className="text-muted-foreground text-xs">{tool.description}</p>
        </div>

        <div>
          <p className="mb-1 font-mono text-muted-foreground text-xs">
            arguments (json)
          </p>
          <Textarea
            className="min-h-24 border-border/60 bg-background/60 font-mono text-xs"
            onChange={(e) => setArgs(e.target.value)}
            value={args}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isRunning}
            onClick={runTool}
            size="sm"
            type="button"
          >
            {isRunning ? (
              <Loader2 className="mr-1 size-3.5 animate-spin" />
            ) : (
              <Play className="mr-1 size-3.5" />
            )}
            Run on live MCP
          </Button>
          <Button
            onClick={() => setExample(selected)}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Wand2 className="mr-1 size-3.5" />
            Reset example
          </Button>
        </div>

        <div>
          <p className="mb-1 font-mono text-muted-foreground text-xs">
            output
          </p>
          <pre className="min-h-[220px] overflow-auto rounded-xl border border-border/60 bg-background/60 p-4 font-mono text-[11px] leading-relaxed">
            {output ?? "// Pick a tool and run it to see live JSON."}
          </pre>
        </div>
      </div>
    </div>
  );
}
