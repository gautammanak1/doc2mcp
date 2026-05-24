"use client";

import {
  Activity,
  CheckCircle,
  Coins,
  Cpu,
  ExternalLink,
  History,
  ShieldAlert,
  Terminal,
  Users,
  Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ProcessingLog, ProjectArtifacts } from "@/types/platform";

export function AdminDashboard({
  initialStats,
  initialProjects,
  userEmail,
}: {
  initialStats: {
    totalUsers: number;
    totalProjects: number;
    totalMCPs: number;
  };
  initialProjects: any[];
  userEmail: string;
}) {
  const [activeTab, setActiveTab] = useState<
    "projects" | "failed" | "tokens" | "logs"
  >("projects");

  // Dynamic metrics computed client-side!
  const metrics = useMemo(() => {
    let totalTokens = 0;
    let failedJobs = 0;
    let successfulJobs = 0;

    for (const p of initialProjects) {
      if (p.status === "error") {
        failedJobs++;
      } else if (p.status === "ready") {
        successfulJobs++;
      }

      const usage = p.tokenUsage as { total_tokens?: number } | null;
      if (usage?.total_tokens) {
        totalTokens += usage.total_tokens;
      }
    }

    const successRate =
      initialProjects.length > 0
        ? Math.round((successfulJobs / initialProjects.length) * 100)
        : 100;

    return {
      totalTokens,
      failedJobs,
      successRate,
    };
  }, [initialProjects]);

  return (
    <main className="min-h-dvh bg-background text-foreground px-6 py-10 sm:px-8 lg:px-16 relative overflow-hidden noise-overlay">
      <div className="mx-auto max-w-7xl relative z-10 space-y-10">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="font-display font-bold text-4xl tracking-tight text-white flex items-center gap-3">
              <Activity className="size-8 text-violet-400" />
              Platform Control Center
            </h1>
            <p className="mt-2 text-muted-foreground text-xs font-mono">
              Signed in as{" "}
              <span className="text-violet-300 font-semibold">{userEmail}</span>{" "}
              (Administrator)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-white/5 hover:bg-white/10 text-white border-white/5 font-mono text-xs rounded-lg"
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Refresh Logs
            </Button>
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
          <MetricCard
            color="cyan"
            icon={<Users className="size-5 text-cyan-400" />}
            label="Total Users"
            value={initialStats.totalUsers}
          />
          <MetricCard
            color="violet"
            icon={<Workflow className="size-5 text-violet-400" />}
            label="Total Projects"
            value={initialStats.totalProjects}
          />
          <MetricCard
            color="emerald"
            icon={<Cpu className="size-5 text-emerald-400" />}
            label="MCP Servers"
            value={initialStats.totalMCPs}
          />
          <MetricCard
            color="red"
            icon={<ShieldAlert className="size-5 text-red-400" />}
            label="Failed Pipelines"
            value={metrics.failedJobs}
          />
          <MetricCard
            color="amber"
            icon={<CheckCircle className="size-5 text-amber-400" />}
            label="Success Rate"
            value={`${metrics.successRate}%`}
          />
          <MetricCard
            color="pink"
            icon={<Coins className="size-5 text-pink-400" />}
            label="Token Usage"
            value={metrics.totalTokens.toLocaleString()}
          />
        </div>

        {/* Tab Controls */}
        <div className="border-b border-white/5 flex gap-1 overflow-x-auto pb-px no-scrollbar">
          <TabButton
            active={activeTab === "projects"}
            icon={<History className="size-4" />}
            label="MCP History"
            onClick={() => setActiveTab("projects")}
          />
          <TabButton
            active={activeTab === "failed"}
            icon={<ShieldAlert className="size-4" />}
            label="Sandbox Diagnostics"
            onClick={() => setActiveTab("failed")}
          />
          <TabButton
            active={activeTab === "tokens"}
            icon={<Coins className="size-4" />}
            label="Token Consumption"
            onClick={() => setActiveTab("tokens")}
          />
          <TabButton
            active={activeTab === "logs"}
            icon={<Terminal className="size-4" />}
            label="Live Crawler Logs"
            onClick={() => setActiveTab("logs")}
          />
        </div>

        {/* Content Section */}
        <div className="glass-card neon-border rounded-2xl p-6 border border-white/5 bg-black/40 min-h-[400px]">
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-white">
                  Recent Conversions
                </h3>
                <p className="text-muted-foreground text-xs">
                  A comprehensive operational history of all pasted URLs and
                  generated tools.
                </p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full min-w-[800px] text-left text-xs font-mono">
                  <thead className="border-white/5 border-b bg-white/5 text-muted-foreground uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-4">Project Name</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Source Documentation URL</th>
                      <th className="px-5 py-4">Semantic Tools</th>
                      <th className="px-5 py-4 text-right">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {initialProjects.map((p) => {
                      const tools =
                        (p.artifacts as ProjectArtifacts | null)
                          ?.compressedTools ?? [];
                      return (
                        <tr
                          className="hover:bg-white/5 transition-colors group"
                          key={p.id}
                        >
                          <td className="px-5 py-4 font-semibold text-white truncate max-w-[150px]">
                            {p.name}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold border ${
                                p.status === "ready"
                                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                  : p.status === "error"
                                    ? "border-red-500/20 bg-red-500/10 text-red-400"
                                    : "border-violet-500/20 bg-violet-500/10 text-violet-400 animate-pulse"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 capitalize text-cyan-300">
                            {p.sourceType}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground max-w-[280px] truncate relative">
                            <a
                              className="hover:text-white transition-colors flex items-center gap-1"
                              href={p.sourceUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {p.sourceUrl}
                              <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-violet-300 font-semibold bg-violet-600/10 border border-violet-500/10 px-2 py-0.5 rounded-md text-[10px]">
                              {tools.length} Tools Inferred
                            </span>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground text-right">
                            {new Date(p.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "failed" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-white">
                  Sandbox Diagnostics
                </h3>
                <p className="text-muted-foreground text-xs">
                  Examine stack traces, processing logs, and crawling failures
                  for troubleshooting.
                </p>
              </div>
              <div className="grid gap-4">
                {initialProjects.filter((p) => p.status === "error").length ===
                0 ? (
                  <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                    <CheckCircle className="size-10 text-emerald-400 mx-auto opacity-45" />
                    <p className="mt-3 text-muted-foreground text-sm font-mono">
                      Zero failed pipelines. System operating cleanly.
                    </p>
                  </div>
                ) : (
                  initialProjects
                    .filter((p) => p.status === "error")
                    .map((p) => {
                      const errorLogs =
                        (p.logs as ProcessingLog[])?.filter(
                          (l) => l.level === "error"
                        ) ?? [];
                      return (
                        <div
                          className="rounded-xl border border-red-500/15 bg-red-950/10 p-5 font-mono text-xs space-y-3"
                          key={p.id}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-white">
                                {p.name}
                              </p>
                              <p className="text-muted-foreground text-[10px] mt-0.5 truncate max-w-[500px]">
                                URL: {p.sourceUrl}
                              </p>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="rounded-lg bg-black/60 border border-white/5 p-3 text-red-300 max-h-40 overflow-y-auto space-y-1">
                            {errorLogs.length > 0 ? (
                              errorLogs.map((l) => (
                                <p key={l.id}>
                                  [{l.timestamp}] [{l.phase ?? "PIPELINE"}]{" "}
                                  {l.message}
                                </p>
                              ))
                            ) : (
                              <p>
                                Pipeline crashed. No fatal error logs recorded.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {activeTab === "tokens" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-white">
                  AI Token Consumption
                </h3>
                <p className="text-muted-foreground text-xs">
                  Track detailed LLM tokens and credit budgets spent across the
                  platform pipeline.
                </p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full min-w-[700px] text-left text-xs font-mono">
                  <thead className="border-white/5 border-b bg-white/5 text-muted-foreground uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-4">Project Name</th>
                      <th className="px-5 py-4">Prompt Tokens</th>
                      <th className="px-5 py-4">Completion Tokens</th>
                      <th className="px-5 py-4">Total Tokens</th>
                      <th className="px-5 py-4 text-right">
                        Inferred Quality Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {initialProjects.map((p) => {
                      const usage = p.tokenUsage as {
                        prompt_tokens?: number;
                        completion_tokens?: number;
                        total_tokens?: number;
                      } | null;
                      const artifacts = p.artifacts as ProjectArtifacts | null;
                      return (
                        <tr
                          className="hover:bg-white/5 transition-colors"
                          key={p.id}
                        >
                          <td className="px-5 py-4 font-semibold text-white">
                            {p.name}
                          </td>
                          <td className="px-5 py-4 text-cyan-300">
                            {(usage?.prompt_tokens ?? 0).toLocaleString()}
                          </td>
                          <td className="px-5 py-4 text-pink-300">
                            {(usage?.completion_tokens ?? 0).toLocaleString()}
                          </td>
                          <td className="px-5 py-4 text-white">
                            {(usage?.total_tokens ?? 0).toLocaleString()}
                          </td>
                          <td className="px-5 py-4 text-right text-emerald-400 font-semibold">
                            {artifacts?.qualityScore?.mcpScore
                              ? `${artifacts.qualityScore.mcpScore}%`
                              : "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-white">
                  Crawl & Extraction Logs
                </h3>
                <p className="text-muted-foreground text-xs">
                  Global live stream of page crawls and AI extraction pipelines.
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/60 p-4 max-h-[500px] overflow-y-auto font-mono text-xs text-violet-200 space-y-1.5 no-scrollbar">
                {initialProjects
                  .flatMap((p) =>
                    ((p.logs as ProcessingLog[]) ?? []).map((l) => ({
                      ...l,
                      projectName: p.name,
                    }))
                  )
                  .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                  .slice(0, 80)
                  .map((l) => (
                    <div
                      className="flex gap-3 border-b border-white/5 pb-1.5 last:border-0"
                      key={l.id}
                    >
                      <span className="text-muted-foreground">
                        [{l.timestamp.slice(11, 19)}]
                      </span>
                      <span className="text-cyan-400 font-semibold">
                        [{l.projectName}]
                      </span>
                      <span
                        className={`font-semibold ${
                          l.level === "success"
                            ? "text-emerald-400"
                            : l.level === "error"
                              ? "text-red-400"
                              : "text-violet-300"
                        }`}
                      >
                        {l.message}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  const glowColors: Record<string, string> = {
    cyan: "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    violet: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
    emerald: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    red: "group-hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    amber: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    pink: "group-hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]",
  };

  return (
    <div
      className={`rounded-2xl border border-white/5 bg-card/30 p-5 backdrop-blur-xl transition-all duration-300 group hover:-translate-y-0.5 ${glowColors[color]}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-muted-foreground text-[10px] uppercase tracking-wider">
          {label}
        </span>
        {icon}
      </div>
      <p className="mt-3 font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
        {value}
      </p>
    </div>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex items-center gap-2 rounded-t-xl px-4 py-3 font-mono text-[11px] transition-all border-b-2 tracking-wide font-medium ${
        active
          ? "border-violet-500 bg-white/5 text-violet-300"
          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
