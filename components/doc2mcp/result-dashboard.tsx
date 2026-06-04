"use client";

import { motion, type Variants } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Bot,
  Brain,
  Check,
  Copy,
  Download,
  FileText,
  Gauge,
  Globe,
  Layers,
  Network,
  Search,
  Server,
  Workflow,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ApiGraph } from "@/components/doc2mcp/api-graph";
import { InstallButtons } from "@/components/doc2mcp/install-buttons";
import { McpPlayground } from "@/components/doc2mcp/mcp-playground";
import { McpRegistryBanner } from "@/components/doc2mcp/mcp-registry-banner";
import { PublishToRegistryPanel } from "@/components/doc2mcp/publish-to-registry-panel";
import { ToolCard } from "@/components/doc2mcp/tool-card";
import { Button } from "@/components/ui/button";
import type { PlatformProject } from "@/lib/db/schema";
import { buildInstallTargets } from "@/lib/marketplace/install";
import { cn } from "@/lib/utils";
import { generateMcpExportBundle } from "@/services/mcp/exports";
import type {
  CompressedTool,
  McpServerConfig,
  ProcessingLog,
  ProjectArtifacts,
  ProjectStatus,
  SuggestedWorkflow,
} from "@/types/platform";

const AGENT_BADGES = [
  "Cursor",
  "Claude",
  "OpenAI",
  "VS Code",
  "Windsurf",
] as const;

const PIPELINE_STAGES = [
  { id: "docs", label: "Documentation", icon: FileText },
  { id: "crawler", label: "Crawler", icon: Globe },
  { id: "processing", label: "Knowledge Processing", icon: Brain },
  { id: "retrieval", label: "Retrieval Layer", icon: Search },
  { id: "mcp", label: "MCP Server", icon: Server },
  { id: "agents", label: "AI Agents", icon: Bot },
] as const;

function useLiveOrigin(): string | null {
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  return origin;
}

/** Replace any baked-in (often localhost) host before /api/mcp/ with the live origin. */
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
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] text-emerald-300 uppercase tracking-wider">
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
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 font-mono text-[10px] text-red-300 uppercase tracking-wider">
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 font-mono text-[10px] text-sky-300 uppercase tracking-wider">
      <span className="size-1.5 animate-pulse rounded-full bg-sky-400" />
      {status}
    </span>
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 28 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      viewport={{ once: true, margin: "-80px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.section>
  );
}

const gridStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const gridItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

function useCountUp(target: number, durationMs = 1100): number {
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

type Accent = {
  chip: string;
  glow: string;
  value: string;
};

const ACCENTS: Record<string, Accent> = {
  violet: {
    chip: "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300",
    glow: "bg-violet-500/30",
    value:
      "from-violet-600 to-fuchsia-600 dark:from-violet-300 dark:to-fuchsia-300",
  },
  sky: {
    chip: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300",
    glow: "bg-sky-500/30",
    value: "from-sky-600 to-cyan-600 dark:from-sky-300 dark:to-cyan-300",
  },
  emerald: {
    chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    glow: "bg-emerald-500/30",
    value:
      "from-emerald-600 to-teal-600 dark:from-emerald-300 dark:to-teal-300",
  },
  amber: {
    chip: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
    glow: "bg-amber-500/30",
    value:
      "from-amber-600 to-orange-600 dark:from-amber-300 dark:to-orange-300",
  },
};

function MetricCard({
  icon: Icon,
  label,
  value,
  suffix,
  accent,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  suffix?: string;
  accent: keyof typeof ACCENTS;
}) {
  const display = useCountUp(value);
  const tone = ACCENTS[accent];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-foreground/[0.02] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20">
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
          tone.glow
        )}
      />
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-lg border",
          tone.chip
        )}
      >
        <Icon className="size-4" />
      </span>
      <p
        className={cn(
          "mt-4 bg-gradient-to-r bg-clip-text font-display font-semibold text-3xl text-transparent tabular-nums",
          tone.value
        )}
      >
        {display}
        {suffix}
      </p>
      <p className="mt-1 text-muted-foreground text-sm">{label}</p>
    </div>
  );
}

function VisualPipeline() {
  return (
    <section className="glass-card rounded-2xl border border-border/60 bg-foreground/[0.02] p-6">
      <div className="flex items-center gap-2">
        <Network className="size-4 text-violet-300" />
        <h2 className="font-display font-semibold text-lg">
          Infrastructure pipeline
        </h2>
      </div>
      <p className="mt-1 text-muted-foreground text-sm">
        Live data path from your docs to connected AI agents.
      </p>
      <div className="relative mt-6">
        {/* Desktop flowing data track */}
        <div className="pointer-events-none absolute inset-x-16 top-8 hidden h-px overflow-hidden bg-foreground/10 lg:block">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-emerald-400 to-transparent [animation:flow-pulse_2.6s_linear_infinite]" />
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          {PIPELINE_STAGES.map((stage, index) => (
            <div
              className="flex items-center gap-3 lg:flex-1 lg:flex-col lg:gap-3"
              key={stage.id}
            >
              <motion.div
                className="flex w-full items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 lg:flex-col lg:gap-2 lg:text-center"
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ delay: index * 0.1, duration: 0.45, ease: EASE }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  <stage.icon className="size-4" />
                </span>
                <div className="min-w-0 lg:text-center">
                  <p className="truncate font-medium text-sm">{stage.label}</p>
                  <p className="flex items-center gap-1 font-mono text-[10px] text-emerald-300/80 uppercase lg:justify-center">
                    <Check className="size-3" />
                    ready
                  </p>
                </div>
              </motion.div>
              {index < PIPELINE_STAGES.length - 1 ? (
                <span className="h-4 w-px shrink-0 bg-gradient-to-b from-emerald-400/50 to-transparent lg:hidden" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function McpServerCard({
  config,
  endpoint,
  pageCount,
  toolCount,
}: {
  config: McpServerConfig | null;
  endpoint: string | null;
  pageCount: number;
  toolCount: number;
}) {
  const json = useMemo(() => JSON.stringify(config, null, 2), [config]);
  const serverName = config?.name ?? "mcp";

  return (
    <section className="glass-card overflow-hidden rounded-2xl border border-violet-500/15 bg-gradient-to-b from-violet-500/[0.05] to-transparent">
      <div className="flex flex-col gap-3 border-border/60 border-b p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Server className="size-4 text-violet-300" />
            <h2 className="font-display font-semibold text-xl">MCP Server</h2>
            <StatusBadge status="ready" />
          </div>
          <p className="mt-1 text-muted-foreground text-sm">
            Hosted, remote MCP endpoint — no local install required.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AGENT_BADGES.map((badge) => (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-border bg-foreground/5 px-2.5 py-1 font-mono text-[10px] text-foreground/70"
              key={badge}
            >
              <span className="size-1.5 rounded-full bg-violet-400" />
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-5 p-6">
        {endpoint ? (
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Endpoint
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border/60 bg-foreground/5 p-2 pl-3">
              <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground/90">
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
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat
            label="Status"
            value="Operational"
            valueClass="text-emerald-300"
          />
          <MiniStat label="Version" value={config?.version ?? "1.0.0"} />
          <MiniStat label="Transport" value="Remote HTTP" />
          <MiniStat label="Pages" value={String(pageCount)} />
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/50 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 border-border/60 border-b px-3 py-2">
            <span className="size-2.5 rounded-full bg-red-400/70" />
            <span className="size-2.5 rounded-full bg-amber-400/70" />
            <span className="size-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-2 text-muted-foreground">
              {serverName} — remote
            </span>
          </div>
          <div className="space-y-1 p-3 leading-relaxed">
            <p>
              <span className="text-violet-300">$</span> doc2mcp connect{" "}
              {serverName}
            </p>
            <p className="text-muted-foreground">
              → handshake /api/mcp · bearer auth
            </p>
            <p className="text-emerald-300">
              ✓ Connected successfully · {toolCount} tools · {pageCount} pages
              indexed
            </p>
          </div>
        </div>

        <details className="group rounded-xl border border-border/60 bg-foreground/[0.03]">
          <summary className="flex cursor-pointer items-center justify-between p-3 font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
            <span>Production MCP configuration (JSON)</span>
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
          <pre className="max-h-72 overflow-auto border-border/60 border-t p-4 font-mono text-[11px] leading-relaxed">
            {json}
          </pre>
        </details>
      </div>
    </section>
  );
}

function MiniStat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-foreground/[0.03] p-3">
      <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className={cn("mt-1 truncate font-medium text-sm", valueClass)}>
        {value}
      </p>
    </div>
  );
}

const LOG_TONE: Record<string, string> = {
  success: "border-emerald-400 bg-emerald-400",
  error: "border-red-400 bg-red-400",
  warn: "border-amber-400 bg-amber-400",
  info: "border-sky-400 bg-sky-400",
};

function ActivityTimeline({ logs }: { logs: ProcessingLog[] }) {
  if (logs.length === 0) {
    return null;
  }
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Activity className="size-4 text-violet-300" />
        <h2 className="font-display font-semibold text-xl">Activity</h2>
      </div>
      <ol className="relative ml-1 space-y-4 border-border border-l pl-6">
        {logs.map((log) => (
          <li className="relative" key={log.id}>
            <span
              className={cn(
                "-left-[1.7rem] absolute top-1 size-2.5 rounded-full border-2",
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
    </section>
  );
}

function ConfigPanel({
  title,
  config,
  hint,
  onCopy,
  onDownload,
}: {
  title: string;
  config: string;
  hint?: string;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <div className="flex gap-1">
          <Button onClick={onCopy} size="sm" type="button" variant="ghost">
            <Copy className="size-3.5" />
          </Button>
          <Button onClick={onDownload} size="sm" type="button" variant="ghost">
            <Download className="size-3.5" />
          </Button>
        </div>
      </div>
      {hint ? (
        <p className="mt-2 text-muted-foreground text-xs">{hint}</p>
      ) : null}
      <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-foreground/5 p-3 font-mono text-[10px]">
        {config}
      </pre>
    </div>
  );
}

function WorkflowCard({ workflow }: { workflow: SuggestedWorkflow }) {
  const relatedTools = workflow.relatedTools.slice(0, 4);
  const visibleSteps = workflow.steps.slice(0, 4);

  return (
    <div className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display font-semibold text-foreground">
              {workflow.name}
            </h3>
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300 uppercase">
              {workflow.category}
            </span>
          </div>
          <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
            {workflow.description}
          </p>
        </div>
        <div className="shrink-0 rounded-lg border border-border/60 bg-foreground/5 px-2 py-1 text-right">
          <p className="font-mono text-[9px] text-muted-foreground uppercase">
            score
          </p>
          <p className="font-semibold text-emerald-300 text-sm">
            {workflow.confidence}%
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {visibleSteps.map((step, index) => (
          <div className="flex gap-3" key={step.id}>
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 font-mono text-[10px] text-emerald-300">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">{step.name}</p>
              <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {relatedTools.map((tool) => (
          <span
            className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] text-violet-200"
            key={tool}
          >
            {tool}
          </span>
        ))}
      </div>
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
  const tools = useMemo(
    () => dedupeTools(artifacts.compressedTools ?? []),
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
      animate={{ opacity: 1 }}
      className="space-y-8"
      initial={{ opacity: 0 }}
    >
      {/* Project header */}
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-[10px] text-violet-200 uppercase tracking-wider">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-violet-400" />
          </span>
          MCP infrastructure · live
        </span>
        <h1 className="mt-4 font-display font-semibold text-4xl tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-br from-foreground via-foreground to-violet-500 bg-clip-text text-transparent dark:to-violet-200">
            {project.name}
          </span>
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Documentation infrastructure for AI agents
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
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
      </motion.section>

      {/* Metrics */}
      <motion.section
        animate="show"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        initial="hidden"
        variants={gridStagger}
      >
        <motion.div variants={gridItem}>
          <MetricCard
            accent="violet"
            icon={FileText}
            label="Pages indexed"
            value={pageCount}
          />
        </motion.div>
        <motion.div variants={gridItem}>
          <MetricCard
            accent="sky"
            icon={Wrench}
            label="MCP tools generated"
            value={tools.length}
          />
        </motion.div>
        <motion.div variants={gridItem}>
          <MetricCard
            accent="emerald"
            icon={Layers}
            label="API endpoints"
            value={endpointCount}
          />
        </motion.div>
        <motion.div variants={gridItem}>
          <MetricCard
            accent="amber"
            icon={Gauge}
            label="MCP score"
            suffix="%"
            value={mcpScore}
          />
        </motion.div>
      </motion.section>

      <Reveal>
        <VisualPipeline />
      </Reveal>

      <Reveal>
        <McpServerCard
          config={fixedConfig}
          endpoint={endpoint}
          pageCount={pageCount}
          toolCount={fixedConfig?.tools?.length ?? tools.length}
        />
      </Reveal>

      {installTargets ? (
        <Reveal>
          <InstallButtons targets={installTargets} />
        </Reveal>
      ) : null}

      {/* Token + registry */}
      {artifacts.mcpAccessToken ? (
        <section className="space-y-4">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-5">
            <p className="font-medium text-emerald-200 text-sm">
              Project access token — no install, no third-party API key
            </p>
            <p className="mt-2 text-muted-foreground text-sm">
              Paste the config above into Cursor → Settings → MCP. doc2mcp
              serves {pageCount} pages over the remote URL with the Bearer token
              below.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <code className="max-w-full truncate rounded-lg bg-muted/60 px-3 py-2 font-mono text-[11px]">
                {artifacts.mcpAccessToken}
              </code>
              <Button
                onClick={() =>
                  copyText(artifacts.mcpAccessToken ?? "", "Project token")
                }
                size="sm"
                type="button"
                variant="outline"
              >
                <Copy className="mr-1 size-3.5" />
                Copy token
              </Button>
            </div>
          </div>
          <McpRegistryBanner />
          <PublishToRegistryPanel
            docsUrl={project.sourceUrl ?? ""}
            projectId={project.id}
            projectName={project.name}
          />
        </section>
      ) : null}

      {/* Quality scorecard */}
      {artifacts.qualityScore ? (
        <Reveal className="glass-card block rounded-2xl border border-border/60 bg-foreground/[0.03] p-6">
          <h2 className="font-display font-semibold text-xl text-foreground">
            AI quality scorecard
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Independent analysis of documentation quality and MCP reliability.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <ScoreTile
              accent="emerald"
              label="Docs quality"
              value={artifacts.qualityScore.docsScore}
            />
            <ScoreTile
              accent="sky"
              label="Auth confidence"
              value={artifacts.qualityScore.authConfidence}
            />
            <ScoreTile
              accent="violet"
              label="Workflow inference"
              value={artifacts.qualityScore.workflowConfidence}
            />
            <ScoreTile
              accent="amber"
              label="MCP score"
              value={artifacts.qualityScore.mcpScore}
            />
          </div>
        </Reveal>
      ) : null}

      {/* Workflows */}
      {artifacts.workflows && artifacts.workflows.length > 0 ? (
        <Reveal className="glass-card block rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-6">
          <p className="flex items-center gap-2 font-mono text-emerald-300 text-xs uppercase tracking-wider">
            <Workflow className="size-3.5" />
            Workflow AI engine
          </p>
          <h2 className="mt-2 font-display font-semibold text-xl text-foreground">
            Suggested AI workflows
          </h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {artifacts.workflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        </Reveal>
      ) : null}

      {/* Tools */}
      {tools.length > 0 ? (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Wrench className="size-4 text-violet-300" />
            <h2 className="font-display font-semibold text-xl">
              AI tools
              <span className="ml-2 font-mono text-muted-foreground text-sm">
                {tools.length} generated
              </span>
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {tools.map((tool, index) => (
              <ToolCard index={index} key={tool.name} tool={tool} />
            ))}
          </div>
        </section>
      ) : null}

      {/* IDE exports */}
      {exportBundle ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-display font-semibold text-xl">
              Advanced configs
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Copy or download configs for Claude Desktop, Windsurf, OpenAI
              Agents SDK, and custom MCP clients.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {exportBundle.artifacts.map((artifact) => {
              const content = fixMcpUrlsInText(artifact.content, origin);
              return (
                <ConfigPanel
                  config={content}
                  hint={artifact.installHint}
                  key={artifact.id}
                  onCopy={() => copyText(content, artifact.label)}
                  onDownload={() => downloadFile(artifact.filename, content)}
                  title={artifact.label}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {/* API graph */}
      {artifacts.graphNodes?.length > 0 ? (
        <section>
          <h2 className="mb-4 font-display font-semibold text-xl">API graph</h2>
          <div className="h-[420px] overflow-hidden rounded-2xl border border-border/60">
            <ApiGraph
              edges={artifacts.graphEdges}
              nodes={artifacts.graphNodes}
            />
          </div>
        </section>
      ) : null}

      {/* Search & test */}
      {artifacts.mcpAccessToken ? (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Search className="size-4 text-violet-300" />
            <div>
              <h2 className="font-display font-semibold text-xl">
                Search &amp; test playground
              </h2>
              <p className="text-muted-foreground text-sm">
                Query the live MCP — exactly what Cursor and Claude call.
              </p>
            </div>
          </div>
          <McpPlayground
            projectId={project.id}
            token={artifacts.mcpAccessToken}
            tools={tools}
          />
        </section>
      ) : null}

      <ActivityTimeline logs={logs} />

      <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-6">
        <Check className="size-5 text-emerald-400" />
        <p className="font-medium text-emerald-300">
          MCP ready — paste the config into Cursor and reload
        </p>
      </div>
    </motion.div>
  );
}

function ScoreTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: keyof typeof ACCENTS;
}) {
  const display = useCountUp(value);
  const tone = ACCENTS[accent];
  return (
    <div className="rounded-xl border border-border/60 bg-foreground/5 p-4 text-center">
      <p className="font-mono text-[10px] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 bg-gradient-to-r bg-clip-text font-semibold text-3xl text-transparent",
          tone.value
        )}
      >
        {display}%
      </p>
    </div>
  );
}
