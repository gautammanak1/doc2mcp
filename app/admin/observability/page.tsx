import { connection } from "next/server";
import { ObservabilityDashboard } from "@/components/admin/observability-dashboard";
import {
  getErrorClassDistribution,
  getHourlyBuckets,
  getJobMetricSummary,
  getRecentJobFailures,
} from "@/lib/db/job-metrics";

export default async function AdminObservabilityPage() {
  await connection();
  const [summary, failures, errorClasses, buckets] = await Promise.all([
    getJobMetricSummary(24),
    getRecentJobFailures(25),
    getErrorClassDistribution(24),
    getHourlyBuckets(24),
  ]);

  return (
    <ObservabilityDashboard
      buckets={buckets.map((b) => ({
        hourStart: b.hourStart.toISOString(),
        total: b.total,
        failed: b.failed,
        avgDurationMs: b.avgDurationMs,
      }))}
      errorClasses={errorClasses}
      failures={failures.map((f) => ({
        ...f,
        startedAt: f.startedAt.toISOString(),
      }))}
      summary={summary}
    />
  );
}
