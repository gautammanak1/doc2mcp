"use client";

import {
  Activity,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import { McpPlayground } from "@/components/doc2mcp/mcp-playground";
import { McpRegistryBanner } from "@/components/doc2mcp/mcp-registry-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PlatformProject } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { McpExportArtifact } from "@/services/mcp/exports";
import type {
  CompressedTool,
  GenerationReport,
  ProcessingLog,
  ProjectArtifacts,
} from "@/types/platform";
import { useRealtimeProject } from "./use-realtime-project";

const STATUS_META: Record<
  PlatformProject["status"],
  { label: string; tone: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    tone: "bg-muted text-muted-foreground",
    icon: Clock,
  },
  crawling: {
    label: "Crawling",
    tone: "bg-sky-500/15 text-sky-300",
    icon: Sparkles,
  },
  analyzing: {
    label: "Analyzing",
    tone: "bg-violet-500/15 text-violet-300",
    icon: Sparkles,
  },
  generating: {
    label: "Generating",
    tone: "bg-amber-500/15 text-amber-300",
    icon: Sparkles,
  },
  ready: {
    label: "Ready",
    tone: "bg-emerald-500/15 text-emerald-300",
    icon: CheckCircle2,
  },
  error: { label: "Error", tone: "bg-red-500/15 text-red-300", icon: XCircle },
};

type ExportBundle = {
  serverName: string;
  endpointUrl: string;
  artifacts: McpExportArtifact[];
};

export function ProjectDetail({
  initialProject,
  exportBundle,
}: {
  initialProject: PlatformProject;
  exportBundle: ExportBundle | null;
}) {
  const { project, isProcessing } = useRealtimeProject(initialProject);
  const artifacts = project.artifacts as ProjectArtifacts | null;
  const tools = artifacts?.compressedTools ?? [];
  const logs = (project.logs as ProcessingLog[] | null) ?? [];
  const status = STATUS_META[project.status];
  const StatusIcon = status.icon;
  const report = artifacts?.generationReport;

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const download = (
    filename: string,
    content: string,
    mime = "application/json"
  ) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
            Project
          </p>
          <h1 className="mt-1 truncate font-display font-bold text-3xl tracking-tight">
            {project.name}
          </h1>
          <p className="mt-1 truncate font-mono text-muted-foreground text-xs">
            {project.sourceUrl}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn("gap-1", status.tone)} variant="outline">
            <StatusIcon className="size-3" />
            {status.label}
          </Badge>
          {isProcessing ? (
            <Badge className="gap-1" variant="secondary">
              <Loader2 className="size-3 animate-spin" />
              Live
            </Badge>
          ) : null}
          {artifacts?.mcpConfig ? (
            <Button asChild size="sm" type="button" variant="outline">
              <Link href={`/convert/${project.id}`}>
                <ExternalLink className="mr-1 size-3.5" />
                Convert view
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      <ProjectStats
        artifacts={artifacts}
        logs={logs}
        report={report}
        tools={tools}
      />

      {artifacts?.mcpAccessToken ? <McpRegistryBanner /> : null}

      <Tabs defaultValue="tools">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
          <TabsTrigger value="inspector">Inspector</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4 space-y-4" value="tools">
          {tools.length === 0 ? (
            <EmptyTabState
              description={
                isProcessing
                  ? "Tools will appear here once the pipeline finishes generating MCP tools."
                  : "No compressed tools were generated for this project."
              }
              title="No tools yet"
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {tools.map((tool) => (
                <ToolCard
                  key={tool.name}
                  onCopySchema={() =>
                    copy(
                      JSON.stringify(tool.parameters, null, 2),
                      "Tool schema"
                    )
                  }
                  tool={tool}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent className="mt-4 space-y-4" value="exports">
          {exportBundle ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {exportBundle.artifacts.map((artifact) => (
                <Card key={artifact.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="truncate">
                          {artifact.label}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {artifact.installHint}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => copy(artifact.content, artifact.label)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Copy className="size-3.5" />
                        </Button>
                        <Button
                          onClick={() =>
                            download(
                              artifact.filename,
                              artifact.content,
                              artifact.mimeType
                            )
                          }
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Download className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="max-h-48 overflow-auto rounded-lg bg-black/40 p-3 font-mono text-[10px] leading-relaxed">
                      {artifact.content}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyTabState
              description="MCP config exports will be available once the pipeline finishes."
              title="No exports yet"
            />
          )}
        </TabsContent>

        <TabsContent className="mt-4 space-y-4" value="inspector">
          {artifacts?.mcpAccessToken ? (
            <McpPlayground
              projectId={project.id}
              token={artifacts.mcpAccessToken}
              tools={tools}
            />
          ) : (
            <EmptyTabState
              description="The MCP playground unlocks once the access token is generated."
              title="MCP not ready"
            />
          )}
        </TabsContent>

        <TabsContent className="mt-4" value="logs">
          <LogsPanel isProcessing={isProcessing} logs={logs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectStats({
  artifacts,
  logs,
  report,
  tools,
}: {
  artifacts: ProjectArtifacts | null;
  logs: ProcessingLog[];
  report: GenerationReport | undefined;
  tools: CompressedTool[];
}) {
  const docsPages = artifacts?.docsPageCount ?? 0;
  const confidence = report?.tools.averageConfidence ?? null;
  const totalEndpoints = artifacts?.endpoints?.length ?? 0;
  const lastLog = logs.at(-1);
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile hint="Pages crawled" label="Docs pages" value={docsPages} />
      <StatTile
        hint="Endpoints extracted"
        label="API endpoints"
        value={totalEndpoints}
      />
      <StatTile
        hint="After validation"
        label="MCP tools"
        value={tools.length}
      />
      <StatTile
        hint={confidence === null ? "Pending" : "Avg tool confidence"}
        label="Confidence"
        value={confidence === null ? "—" : `${confidence}%`}
      />
      {lastLog ? (
        <Card className="lg:col-span-4">
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <Activity className="size-4 text-muted-foreground" />
            <span className="font-mono text-muted-foreground text-xs">
              {new Date(lastLog.timestamp).toLocaleTimeString()}
            </span>
            <span className="truncate">{lastLog.message}</span>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 p-5">
        <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
          {label}
        </p>
        <p className="font-display font-bold text-2xl">{value}</p>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function ToolCard({
  tool,
  onCopySchema,
}: {
  tool: CompressedTool;
  onCopySchema: () => void;
}) {
  const endpoints = tool.endpoints ?? [];
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="font-mono text-sm">{tool.name}</CardTitle>
            <CardDescription className="text-xs">
              {tool.description}
            </CardDescription>
          </div>
          {typeof tool.confidence === "number" ? (
            <Badge variant="outline">{tool.confidence}%</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {endpoints.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {endpoints.slice(0, 6).map((endpoint) => (
              <Badge
                className="font-mono text-[10px]"
                key={endpoint}
                variant="secondary"
              >
                {endpoint}
              </Badge>
            ))}
            {endpoints.length > 6 ? (
              <Badge className="text-[10px]" variant="ghost">
                +{endpoints.length - 6}
              </Badge>
            ) : null}
          </div>
        ) : null}
        <div className="flex justify-end">
          <Button
            onClick={onCopySchema}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Copy className="mr-1 size-3" />
            Copy schema
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LogsPanel({
  logs,
  isProcessing,
}: {
  logs: ProcessingLog[];
  isProcessing: boolean;
}) {
  const display = useMemo(() => logs.slice(-200).reverse(), [logs]);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Live pipeline logs</CardTitle>
          <CardDescription>
            {isProcessing
              ? "Streaming via Supabase Realtime + polling fallback."
              : "Final run logs."}
          </CardDescription>
        </div>
        {isProcessing ? (
          <Badge className="gap-1" variant="secondary">
            <Loader2 className="size-3 animate-spin" />
            live
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent>
        {display.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-sm">
            No logs yet. The pipeline will start streaming output here.
          </p>
        ) : (
          <ul className="max-h-[480px] space-y-1 overflow-auto rounded-lg bg-black/40 p-3 font-mono text-[11px]">
            {display.map((log) => (
              <li className="flex gap-3" key={log.id}>
                <span className="shrink-0 text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={cn("shrink-0 uppercase", levelTone(log.level))}
                >
                  [{log.level}]
                </span>
                <span className="break-all">{log.message}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function levelTone(level: ProcessingLog["level"]) {
  if (level === "error") {
    return "text-red-400";
  }
  if (level === "warn") {
    return "text-amber-400";
  }
  if (level === "success") {
    return "text-emerald-400";
  }
  return "text-muted-foreground";
}

function EmptyTabState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="font-semibold text-base">{title}</p>
        <p className="mt-1 text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
