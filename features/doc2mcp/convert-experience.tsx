"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  Check,
  Copy,
  Download,
  Loader2,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AnimatedBackground } from "@/components/doc2mcp/animated-background";
import { ApiGraph } from "@/components/doc2mcp/api-graph";
import { Doc2McpLogo } from "@/components/doc2mcp/logo";
import { McpPlayground } from "@/components/doc2mcp/mcp-playground";
import { McpRegistryBanner } from "@/components/doc2mcp/mcp-registry-banner";
import { PublishToRegistryPanel } from "@/components/doc2mcp/publish-to-registry-panel";
import { PipelineProgress } from "@/components/doc2mcp/pipeline-progress";
import { TerminalLog } from "@/components/doc2mcp/terminal-log";
import { ThemeToggle } from "@/components/doc2mcp/theme-toggle";
import { ToolCard } from "@/components/doc2mcp/tool-card";
import { Button } from "@/components/ui/button";
import type { PlatformProject } from "@/lib/db/schema";
import { generateMcpExportBundle } from "@/services/mcp/exports";
import type {
  CompressedTool,
  ProcessingLog,
  ProjectArtifacts,
  SuggestedWorkflow,
} from "@/types/platform";

const PIPELINE_STEPS = [
  "crawl",
  "auth",
  "extract",
  "workflows",
  "compress",
  "mcp",
  "config",
] as const;

function stepFromStatus(status: string): number {
  switch (status) {
    case "pending":
      return 0;
    case "crawling":
      return 1;
    case "analyzing":
      return 3;
    case "generating":
      return 5;
    case "ready":
      return 7;
    case "error":
      return -1;
    default:
      return 0;
  }
}

export function ConvertExperience({
  initialProject,
}: {
  initialProject: PlatformProject;
}) {
  const [project, setProject] = useState(initialProject);
  const artifacts = project.artifacts as ProjectArtifacts | null;
  const logs = (project.logs as ProcessingLog[]) ?? [];
  const tools = artifacts?.compressedTools ?? [];
  const isProcessing = !["ready", "error"].includes(project.status);
  const currentStep = stepFromStatus(project.status);

  useEffect(() => {
    if (!isProcessing) {
      return;
    }

    const interval = setInterval(async () => {
      const res = await fetch(`/api/projects/${project.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isProcessing, project.id]);

  const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const download = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportBundle = artifacts?.mcpConfig
    ? generateMcpExportBundle({
        config: artifacts.mcpConfig,
        generationReport: artifacts.generationReport,
      })
    : null;

  return (
    <div className="relative min-h-dvh">
      <AnimatedBackground />

      <header className="relative z-10 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link className="flex items-center gap-4" href="/">
            <Doc2McpLogo size={32} />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
              href="/chat"
            >
              <ArrowLeft className="size-3.5" />
              New conversion
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl space-y-10 px-6 py-10">
        {/* URL + status */}
        <section>
          <p className="font-mono text-muted-foreground text-xs">source</p>
          <p className="mt-1 truncate font-mono text-sm">{project.sourceUrl}</p>
          <div className="mt-6">
            <PipelineProgress
              currentStep={currentStep}
              status={project.status}
              steps={PIPELINE_STEPS}
            />
          </div>
        </section>

        {/* Live logs */}
        <section className="glass-card neon-border rounded-2xl p-5">
          <p className="mb-3 font-mono text-muted-foreground text-xs">
            terminal
          </p>
          {logs.length > 0 ? (
            <TerminalLog
              lines={logs.map((l) => `[${l.level}] ${l.message}`)}
              streaming={isProcessing}
            />
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              {isProcessing && <Loader2 className="size-4 animate-spin" />}
              Starting pipeline...
            </div>
          )}
        </section>

        <AnimatePresence>
          {project.status === "ready" && artifacts && (
            <motion.div
              animate={{ opacity: 1 }}
              className="space-y-10"
              initial={{ opacity: 0 }}
            >
              {/* Quality scorecard */}
              {artifacts.qualityScore && (
                <section className="glass-card rounded-2xl p-6 border border-white/5 bg-black/30">
                  <h2 className="font-display font-semibold text-xl text-white">
                    AI Quality Scorecard
                  </h2>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Independent analysis of the documentation quality and
                    generated MCP reliability
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-center">
                      <p className="font-mono text-muted-foreground text-[10px] uppercase">
                        Docs Quality
                      </p>
                      <p className="mt-2 text-3xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {artifacts.qualityScore.docsScore}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-center">
                      <p className="font-mono text-muted-foreground text-[10px] uppercase">
                        Auth Confidence
                      </p>
                      <p className="mt-2 text-3xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        {artifacts.qualityScore.authConfidence}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-center">
                      <p className="font-mono text-muted-foreground text-[10px] uppercase">
                        Workflow Inference
                      </p>
                      <p className="mt-2 text-3xl font-semibold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                        {artifacts.qualityScore.workflowConfidence}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-center">
                      <p className="font-mono text-muted-foreground text-[10px] uppercase">
                        MCP Score
                      </p>
                      <p className="mt-2 text-3xl font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        {artifacts.qualityScore.mcpScore}%
                      </p>
                    </div>
                  </div>
                  {artifacts.qualityScore.explanation && (
                    <div className="mt-4 rounded-lg bg-white/5 border border-white/5 p-3 text-xs text-muted-foreground font-mono">
                      <span className="text-white font-semibold">
                        Evaluation:
                      </span>{" "}
                      {artifacts.qualityScore.explanation}
                    </div>
                  )}
                </section>
              )}

              {artifacts.workflows && artifacts.workflows.length > 0 ? (
                <section className="glass-card rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="flex items-center gap-2 font-mono text-emerald-300 text-xs uppercase tracking-wider">
                        <Workflow className="size-3.5" />
                        Workflow AI Engine
                      </p>
                      <h2 className="mt-2 font-display font-semibold text-xl text-white">
                        Suggested AI Workflows
                      </h2>
                      <p className="mt-1 text-muted-foreground text-sm">
                        Inferred from docs, endpoint relationships, auth
                        signals, and semantic MCP tools.
                      </p>
                    </div>
                    {artifacts.workflowDetection ? (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-right">
                        <p className="font-mono text-[10px] text-emerald-300 uppercase">
                          Confidence
                        </p>
                        <p className="mt-1 font-display font-semibold text-2xl text-emerald-200">
                          {artifacts.workflowDetection.confidence}%
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    {artifacts.workflows.map((workflow) => (
                      <WorkflowCard key={workflow.id} workflow={workflow} />
                    ))}
                  </div>

                  {artifacts.workflowDetection?.recommendations.length ? (
                    <div className="mt-5 rounded-xl border border-white/5 bg-white/5 p-4">
                      <p className="mb-2 flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                        <Brain className="size-3.5 text-violet-300" />
                        AI recommendations
                      </p>
                      <ul className="space-y-1.5 text-muted-foreground text-xs">
                        {artifacts.workflowDetection.recommendations.map(
                          (recommendation) => (
                            <li className="flex gap-2" key={recommendation}>
                              <span className="text-emerald-300">•</span>
                              <span>{recommendation}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  ) : null}
                </section>
              ) : null}

              {/* Compressed tools */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display font-semibold text-xl">
                    AI Tools
                    <span className="ml-2 font-mono text-muted-foreground text-sm">
                      {tools.length} compressed
                    </span>
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tools.map((tool: CompressedTool, i) => (
                    <ToolCard index={i} key={tool.name} tool={tool} />
                  ))}
                </div>
              </section>

              {/* MCP output */}
              <section className="glass-card rounded-2xl p-6">
                <h2 className="font-display font-semibold text-xl">
                  MCP Server
                </h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Production-ready MCP configuration
                </p>
                <pre className="mt-4 max-h-64 overflow-auto rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-[11px] leading-relaxed">
                  {JSON.stringify(artifacts.mcpConfig, null, 2)}
                </pre>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      download(
                        `${artifacts.mcpConfig?.name ?? "mcp"}-server.json`,
                        JSON.stringify(artifacts.mcpConfig, null, 2)
                      )
                    }
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Download className="mr-1 size-3.5" />
                    MCP JSON
                  </Button>
                  <Button
                    onClick={() =>
                      download("llms.txt", artifacts.llmsTxt ?? "")
                    }
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Download className="mr-1 size-3.5" />
                    llms.txt
                  </Button>
                </div>
              </section>

              {/* MCP setup — platform token only */}
              <section className="col-span-full space-y-4">
                {artifacts.mcpAccessToken ? (
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-5">
                    <p className="font-medium text-emerald-200 text-sm">
                      Cursor MCP — no install, no third-party API key
                    </p>
                    <p className="mt-2 text-muted-foreground text-sm">
                      Paste the JSON below into Cursor → Settings → MCP. doc2mcp
                      serves {artifacts.docsPageCount ?? 0} pages over a remote
                      URL with the Bearer token shown below.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <code className="max-w-full truncate rounded-lg bg-black/50 px-3 py-2 font-mono text-[11px]">
                        {artifacts.mcpAccessToken}
                      </code>
                      <Button
                        onClick={() =>
                          copyText(
                            artifacts.mcpAccessToken ?? "",
                            "Project token"
                          )
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
                ) : null}

                {artifacts.mcpAccessToken ? <McpRegistryBanner /> : null}

                {artifacts.mcpAccessToken ? (
                  <PublishToRegistryPanel
                    docsUrl={project.sourceUrl}
                    projectId={project.id}
                    projectName={project.name}
                  />
                ) : null}
              </section>

              {exportBundle ? (
                <section className="space-y-4">
                  <div>
                    <h2 className="font-display font-semibold text-xl">
                      One-click IDE exports
                    </h2>
                    <p className="mt-1 text-muted-foreground text-sm">
                      Installable configs for Cursor, Claude Desktop, VSCode,
                      Windsurf, OpenAI Agents SDK, hosted MCP endpoints, and
                      validation reports.
                    </p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {exportBundle.artifacts.map((artifact) => (
                      <ConfigPanel
                        config={artifact.content}
                        hint={artifact.installHint}
                        key={artifact.id}
                        onCopy={() =>
                          copyText(artifact.content, artifact.label)
                        }
                        onDownload={() =>
                          download(artifact.filename, artifact.content)
                        }
                        title={artifact.label}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {/* API Graph */}
              {artifacts.graphNodes?.length > 0 && (
                <section>
                  <h2 className="mb-4 font-display font-semibold text-xl">
                    API Graph
                  </h2>
                  <div className="h-[420px] overflow-hidden rounded-2xl border border-white/5">
                    <ApiGraph
                      edges={artifacts.graphEdges}
                      nodes={artifacts.graphNodes}
                    />
                  </div>
                </section>
              )}

              {/* MCP Playground */}
              {artifacts.mcpAccessToken ? (
                <section>
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <h2 className="font-display font-semibold text-xl">
                        MCP Playground
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        Test the same MCP that Cursor uses — runs against this
                        project's live token.
                      </p>
                    </div>
                  </div>
                  <McpPlayground
                    projectId={project.id}
                    token={artifacts.mcpAccessToken}
                    tools={artifacts.compressedTools}
                  />
                </section>
              ) : null}

              {/* Done CTA */}
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-6">
                <Check className="size-5 text-emerald-400" />
                <p className="font-medium text-emerald-300">
                  MCP ready — paste config into Cursor and reload
                </p>
              </div>
            </motion.div>
          )}

          {project.status === "error" && (
            <motion.div
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center"
              initial={{ opacity: 0 }}
            >
              <p className="text-red-300">
                Conversion failed. Try another URL.
              </p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/">Start over</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function WorkflowCard({ workflow }: { workflow: SuggestedWorkflow }) {
  const relatedTools = workflow.relatedTools.slice(0, 4);
  const visibleSteps = workflow.steps.slice(0, 4);

  return (
    <div className="rounded-2xl border border-white/5 bg-black/25 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display font-semibold text-white">
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
        <div className="shrink-0 rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-right">
          <p className="font-mono text-[9px] text-muted-foreground uppercase">
            score
          </p>
          <p className="font-semibold text-emerald-300 text-sm">
            {workflow.confidence}%
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-3">
        <p className="font-mono text-[10px] text-muted-foreground uppercase">
          Agent use case
        </p>
        <p className="mt-1 text-foreground/80 text-xs leading-relaxed">
          {workflow.useCase}
        </p>
      </div>

      <div className="mt-4 space-y-2">
        {visibleSteps.map((step, index) => (
          <div className="flex gap-3" key={step.id}>
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 font-mono text-[10px] text-emerald-300">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-sm">{step.name}</p>
                <span className="rounded-full bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground uppercase">
                  {step.type}
                </span>
              </div>
              <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
                {step.description}
              </p>
              {step.toolName ? (
                <p className="mt-1 font-mono text-[10px] text-violet-300">
                  tool: {step.toolName}
                </p>
              ) : null}
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
        {workflow.relatedTools.length > relatedTools.length ? (
          <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            +{workflow.relatedTools.length - relatedTools.length} more
          </span>
        ) : null}
      </div>

      <details className="mt-4 rounded-xl border border-white/5 bg-black/30 p-3">
        <summary className="cursor-pointer font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          Agent prompt
        </summary>
        <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-foreground/80 leading-relaxed">
          {workflow.agentPrompt}
        </pre>
      </details>
    </div>
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
      <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-black/40 p-3 font-mono text-[10px]">
        {config}
      </pre>
    </div>
  );
}
