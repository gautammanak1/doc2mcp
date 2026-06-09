import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ProjectDetail } from "@/components/dashboard/project-detail";
import { getUserPlan } from "@/lib/billing/entitlements";
import { getMcpHitStats, getPlatformProjectById } from "@/lib/db/queries";
import { generateMcpExportBundle } from "@/services/mcp/exports";
import type { ProjectArtifacts } from "@/types/platform";

export default async function DashboardProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?redirectUrl=/dashboard/projects/${id}`);
  }

  const project = await getPlatformProjectById({
    id,
    userId: session.user.id,
  });

  if (!project) {
    notFound();
  }

  const artifacts = project.artifacts as ProjectArtifacts | null;
  const exportBundle = artifacts?.mcpConfig
    ? generateMcpExportBundle({
        config: artifacts.mcpConfig,
        generationReport: artifacts.generationReport,
      })
    : null;

  const [plan, hitStats] = await Promise.all([
    getUserPlan(session.user.id),
    getMcpHitStats({ projectId: id }),
  ]);

  return (
    <ProjectDetail
      canPublishCompany={plan.entitlements.privateProjects}
      exportBundle={exportBundle}
      hitStats={hitStats}
      initialProject={project}
    />
  );
}
