import {
  handleMcpOverview,
  mcpError,
  resolveMcpProject,
} from "@/lib/doc2mcp/mcp-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const resolved = await resolveMcpProject(request, projectId);

  if ("error" in resolved) {
    if (resolved.error === "not_found") {
      return mcpError("not_found", 404);
    }
    if (resolved.error === "not_ready") {
      return mcpError("project_not_ready", 409);
    }
    return mcpError("unauthorized", 401);
  }

  return handleMcpOverview(
    resolved.project,
    resolved.pages,
    resolved.artifacts
  );
}
