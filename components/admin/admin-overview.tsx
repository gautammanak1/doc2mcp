import { getAdminStats, getAllProjects } from "@/lib/db/queries";
export async function AdminOverview() {
  const [statsResult, projectsResult] = await Promise.allSettled([
    getAdminStats(),
    getAllProjects(10),
  ]);
  const stats =
    statsResult.status === "fulfilled"
      ? statsResult.value
      : { totalUsers: 0, totalProjects: 0, totalMCPs: 0 };
  const projects =
    projectsResult.status === "fulfilled" ? projectsResult.value : [];

  let failedJobs = 0;
  let successfulJobs = 0;
  let totalTokens = 0;

  for (const p of projects) {
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
    projects.length > 0
      ? Math.round((successfulJobs / projects.length) * 100)
      : 100;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} />
        <StatCard label="Total projects" value={stats.totalProjects} />
        <StatCard label="MCP servers" value={stats.totalMCPs} />
        <StatCard label="Success rate" value={`${successRate}%`} />
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
        <h2 className="font-semibold text-lg">Recent conversions</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Latest MCP pipeline runs · {failedJobs} failed ·{" "}
          {totalTokens.toLocaleString()} tokens (recent sample)
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-border/50 border-b text-muted-foreground text-xs">
              <tr>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Source</th>
                <th className="pb-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 pr-4 font-medium">{p.name}</td>
                  <td className="py-3 pr-4 capitalize">{p.status}</td>
                  <td className="max-w-[240px] truncate py-3 pr-4 text-muted-foreground">
                    {p.sourceUrl}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-5">
      <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-2 font-display font-bold text-3xl">{value}</p>
    </div>
  );
}
