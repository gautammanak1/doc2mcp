"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  FileText,
  Gauge,
  Globe,
  Layers,
  MessageSquare,
  Server,
  TerminalSquare,
  Workflow,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { InstallButtons } from "@/components/doc2mcp/install-buttons";
import { McpChat } from "@/components/doc2mcp/mcp-chat";
import { McpPlayground } from "@/components/doc2mcp/mcp-playground";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PlatformProject } from "@/lib/db/schema";
import { buildInstallTargets } from "@/lib/marketplace/install";
import { cn } from "@/lib/utils";
import { DOC_MCP_TOOLS } from "@/services/mcp/doc-tools";
import { generateMcpExportBundle } from "@/services/mcp/exports";
import type {
  CompressedTool,
  McpServerConfig,
  ProcessingLog,
  ProjectArtifacts,
  ProjectStatus,
  SuggestedWorkflow,
} from "@/types/platform";

const AGENT_BADGES = ["Cursor", "Claude", "OpenAI", "VS Code", "Windsurf"];

function useLiveOrigin(): string | null {
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  return origin;
}

function fixMcpUrlsInText(text: string, origin: string | null): string {
  if (!origin) {
    return text;
  }
  return text.replace(/https?:\/\/[^/"\\\s]+(\/api\/mcp\/)/g, `${origin}$1`);
}

function fixMcpUrlsInConfig(
  config: McpServerConfig | null,
  origin: string | null
): McpServerConfig | null {
  if (!(config && origin)) {
    return config;
  }
  try {
    return JSON.parse(fixMcpUrlsInText(JSON.stringify(config), origin));
  } catch {
    return config;
  }
}

function getServerUrl(config: McpServerConfig | null): string | null {
  const servers = (
    config?.cursorConfig as
      | { mcpServers?: Record<string, { url?: string }> }
      | undefined
  )?.mcpServers;
  if (!servers) {
    return null;
  }
  return Object.values(servers).at(0)?.url ?? null;
}

function dedupeTools(tools: CompressedTool[]): CompressedTool[] {
  const seen = new Set<string>();
  const out: CompressedTool[] = [];
  for (const tool of tools) {
    if (!seen.has(tool.name)) {
      seen.add(tool.name);
      out.push(tool);
    }
  }
  return out;
}

type DisplayTool = { name: string; description: string; endpoints: string[] };

/**
 * Merge the canonical doc2mcp toolset with any project-specific tools and
 * dedupe by name. This removes the duplicate entries the generator sometimes
 * emits while guaranteeing the standard tools always show up.
 */
function buildDisplayTools(project: CompressedTool[]): DisplayTool[] {
  const map = new Map<string, DisplayTool>();
  for (const tool of DOC_MCP_TOOLS) {
    map.set(tool.name, {
      name: tool.name,
      description: tool.description,
      endpoints: [],
    });
  }
  for (const tool of project) {
    const existing = map.get(tool.name);
    if (existing) {
      if (tool.description) {
        existing.description = tool.description;
      }
      if (tool.endpoints?.length) {
        existing.endpoints = tool.endpoints;
      }
    } else {
      map.set(tool.name, {
        name: tool.name,
        description: tool.description ?? "",
        endpoints: tool.endpoints ?? [],
      });
    }
  }
  return [...map.values()];
}

function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function copyText(text: string, label: string) {
  await navigator.clipboard.writeText(text);
  toast.success(`${label} copied`);
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function StatusBadge({ status }: { status: ProjectStatus | string }) {
  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] text-emerald-600 uppercase tracking-wider dark:text-emerald-300">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
        </span>
        Live
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 font-mono text-[10px] text-red-600 uppercase tracking-wider dark:text-red-300">
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 font-mono text-[10px] text-sky-600 uppercase tracking-wider dark:text-sky-300">
      <span className="size-1.5 animate-pulse rounded-full bg-sky-400" />
      {status}
    </span>
  );
}

function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    let raf = 0;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  suffix?: string;
}) {
  const display = useCountUp(value);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 font-semibold text-2xl tabular-nums">
        {display}
        {suffix}
      </p>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-2.5">
      <span className="mt-0.5 flex size-7 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div>
        <h2 className="font-semibold text-base">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function ConnectTab({
  config,
  endpoint,
  token,
  pageCount,
}: {
  config: McpServerConfig | null;
  endpoint: string | null;
  token: string | null;
  pageCount: number;
}) {
  const json = useMemo(() => JSON.stringify(config, null, 2), [config]);
  const serverName = config?.name ?? "mcp";

  return (
    <div className="space-y-5">
      {endpoint ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionHeading
            description="Hosted, remote MCP endpoint — no local install required."
            icon={Server}
            title="MCP endpoint"
          />
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-1.5 pl-3">
            <code className="min-w-0 flex-1 truncate font-mono text-foreground/90 text-xs">
              {endpoint}
            </code>
            <Button
              onClick={() => copyText(endpoint, "Endpoint")}
              size="sm"
              type="button"
              variant="outline"
            >
              <Copy className="mr-1 size-3.5" />
              Copy
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {AGENT_BADGES.map((badge) => (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1 font-mono text-[10px] text-muted-foreground"
                key={badge}
              >
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {token ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionHeading
            description="Paste the config into Cursor → Settings → MCP. doc2mcp serves the docs over the remote URL using this Bearer token."
            icon={Check}
            title="Access token"
          />
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 max-w-full flex-1 truncate rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-[11px]">
              {token}
            </code>
            <Button
              onClick={() => copyText(token, "Project token")}
              size="sm"
              type="button"
              variant="outline"
            >
              <Copy className="mr-1 size-3.5" />
              Copy token
            </Button>
          </div>
        </div>
      ) : null}

      <details className="group rounded-xl border border-border bg-card">
        <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-sm">
          <span className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            MCP configuration (JSON) · {pageCount} pages
          </span>
          <span className="flex gap-1">
            <Button
              onClick={(event) => {
                event.preventDefault();
                copyText(json, "MCP config");
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Copy className="size-3.5" />
            </Button>
            <Button
              onClick={(event) => {
                event.preventDefault();
                downloadFile(`${serverName}-server.json`, json);
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Download className="size-3.5" />
            </Button>
          </span>
        </summary>
        <pre className="max-h-80 overflow-auto border-border border-t p-4 font-mono text-[11px] leading-relaxed">
          {json}
        </pre>
      </details>
    </div>
  );
}

function ToolsTab({ tools }: { tools: DisplayTool[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <SectionHeading
        description={`${tools.length} tools your AI agent can call against these docs.`}
        icon={Wrench}
        title="MCP tools"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((tool) => (
          <div
            className="rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/40"
            key={tool.name}
          >
            <p className="font-medium font-mono text-foreground text-sm">
              {tool.name}
              <span className="text-muted-foreground">()</span>
            </p>
            <p className="mt-1.5 text-muted-foreground text-xs leading-relaxed">
              {tool.description}
            </p>
            {tool.endpoints.length > 0 ? (
              <p className="mt-2.5 truncate font-mono text-[10px] text-muted-foreground/60">
                {tool.endpoints.join(" · ")}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

const LOG_TONE: Record<string, string> = {
  success: "bg-emerald-400",
  error: "bg-red-400",
  warn: "bg-amber-400",
  info: "bg-sky-400",
};

function InsightsTab({
  workflows,
  logs,
}: {
  workflows: SuggestedWorkflow[];
  logs: ProcessingLog[];
}) {
  return (
    <div className="space-y-5">
      {workflows.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionHeading
            description="Common multi-step flows doc2mcp inferred from your docs."
            icon={Workflow}
            title="Suggested workflows"
          />
          <div className="grid gap-3 lg:grid-cols-2">
            {workflows.map((workflow) => (
              <div
                className="rounded-lg border border-border bg-background p-4"
                key={workflow.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-sm">{workflow.name}</h3>
                  <span className="shrink-0 font-mono text-emerald-600 text-xs dark:text-emerald-300">
                    {workflow.confidence}%
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                  {workflow.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {workflow.relatedTools.slice(0, 4).map((tool) => (
                    <span
                      className="rounded-full border border-border bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                      key={tool}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {logs.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionHeading icon={Activity} title="Build activity" />
          <ol className="relative ml-1 space-y-4 border-border border-l pl-6">
            {logs.map((log) => (
              <li className="relative" key={log.id}>
                <span
                  className={cn(
                    "-left-[1.7rem] absolute top-1 size-2.5 rounded-full",
                    LOG_TONE[log.level] ?? LOG_TONE.info
                  )}
                />
                <p className="text-foreground/90 text-sm">{log.message}</p>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {formatDateTime(log.timestamp)}
                  {log.phase ? ` · ${log.phase}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {workflows.length === 0 && logs.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground text-sm">
          No additional insights for this project.
        </p>
      ) : null}
    </div>
  );
}

export function ResultDashboard({
  project,
  artifacts,
}: {
  project: PlatformProject;
  artifacts: ProjectArtifacts;
}) {
  const origin = useLiveOrigin();
  const logs = (project.logs as ProcessingLog[]) ?? [];

  const compressedTools = useMemo(
    () => dedupeTools(artifacts.compressedTools ?? []),
    [artifacts.compressedTools]
  );
  const displayTools = useMemo(
    () => buildDisplayTools(artifacts.compressedTools ?? []),
    [artifacts.compressedTools]
  );

  const fixedConfig = useMemo(
    () => fixMcpUrlsInConfig(artifacts.mcpConfig, origin),
    [artifacts.mcpConfig, origin]
  );
  const endpoint = useMemo(() => getServerUrl(fixedConfig), [fixedConfig]);

  const pageCount = artifacts.docsPageCount ?? 0;
  const endpointCount = artifacts.endpoints?.length ?? 0;
  const mcpScore = artifacts.qualityScore?.mcpScore ?? 0;
  const token = artifacts.mcpAccessToken ?? null;

  const exportBundle = useMemo(() => {
    if (!fixedConfig) {
      return null;
    }
    return generateMcpExportBundle({
      config: fixedConfig,
      generationReport: artifacts.generationReport,
    });
  }, [fixedConfig, artifacts.generationReport]);

  const installTargets = useMemo(
    () => buildInstallTargets({ mcpConfig: fixedConfig }),
    [fixedConfig]
  );

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <section>
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-3xl tracking-tight">
            {project.name}
          </h1>
          <StatusBadge status="ready" />
        </div>
        <p className="mt-1.5 text-muted-foreground">
          Documentation infrastructure for AI agents
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
          <a
            className="inline-flex max-w-full items-center gap-1.5 truncate font-mono text-muted-foreground text-xs hover:text-foreground"
            href={project.sourceUrl ?? "#"}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Globe className="size-3.5 shrink-0" />
            <span className="truncate">{project.sourceUrl}</span>
            <ArrowUpRight className="size-3 shrink-0" />
          </a>
          <span className="font-mono text-muted-foreground text-xs">
            Last sync {formatDateTime(project.updatedAt)}
          </span>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={FileText} label="Pages indexed" value={pageCount} />
        <MetricCard
          icon={Wrench}
          label="MCP tools"
          value={displayTools.length}
        />
        <MetricCard icon={Layers} label="API endpoints" value={endpointCount} />
        <MetricCard
          icon={Gauge}
          label="MCP score"
          suffix="%"
          value={mcpScore}
        />
      </section>

      {/* Install */}
      {installTargets ? <InstallButtons targets={installTargets} /> : null}

      {/* Workspace tabs */}
      <Tabs className="w-full" defaultValue="connect">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger className="gap-1.5" value="connect">
            <Server className="size-3.5" />
            Connect
          </TabsTrigger>
          <TabsTrigger className="gap-1.5" value="chat">
            <MessageSquare className="size-3.5" />
            Chat
          </TabsTrigger>
          <TabsTrigger className="gap-1.5" value="tools">
            <Wrench className="size-3.5" />
            Tools
          </TabsTrigger>
          <TabsTrigger className="gap-1.5" value="test">
            <TerminalSquare className="size-3.5" />
            Test
          </TabsTrigger>
          <TabsTrigger className="gap-1.5" value="insights">
            <Activity className="size-3.5" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-5" value="connect">
          <ConnectTab
            config={fixedConfig}
            endpoint={endpoint}
            pageCount={pageCount}
            token={token}
          />
          {exportBundle ? (
            <div className="mt-5 rounded-xl border border-border bg-card p-5">
              <SectionHeading
                description="Configs for Claude Desktop, Windsurf, OpenAI Agents SDK, and custom MCP clients."
                icon={FileText}
                title="Advanced configs"
              />
              <div className="grid gap-3 lg:grid-cols-2">
                {exportBundle.artifacts.map((artifact) => {
                  const content = fixMcpUrlsInText(artifact.content, origin);
                  return (
                    <div
                      className="rounded-lg border border-border bg-background p-4"
                      key={artifact.id}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">
                          {artifact.label}
                        </h3>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => copyText(content, artifact.label)}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            <Copy className="size-3.5" />
                          </Button>
                          <Button
                            onClick={() =>
                              downloadFile(artifact.filename, content)
                            }
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            <Download className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                      <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-muted/40 p-3 font-mono text-[10px]">
                        {content}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent className="mt-5" value="chat">
          {token ? (
            <McpChat
              pageCount={pageCount}
              projectId={project.id}
              token={token}
            />
          ) : (
            <p className="py-10 text-center text-muted-foreground text-sm">
              Chat becomes available once the MCP token is provisioned.
            </p>
          )}
        </TabsContent>

        <TabsContent className="mt-5" value="tools">
          <ToolsTab tools={displayTools} />
        </TabsContent>

        <TabsContent className="mt-5" value="test">
          {token ? (
            <McpPlayground
              projectId={project.id}
              token={token}
              tools={compressedTools}
            />
          ) : (
            <p className="py-10 text-center text-muted-foreground text-sm">
              The test playground needs an MCP token.
            </p>
          )}
        </TabsContent>

        <TabsContent className="mt-5" value="insights">
          <InsightsTab logs={logs} workflows={artifacts.workflows ?? []} />
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-5">
        <Check className="size-5 text-emerald-500" />
        <p className="font-medium text-emerald-600 dark:text-emerald-300">
          MCP ready — paste the config into Cursor and reload
        </p>
      </div>
    </motion.div>
  );
}
