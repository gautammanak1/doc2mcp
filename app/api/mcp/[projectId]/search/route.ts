import {
  handleMcpSearch,
  mcpError,
  resolveMcpProject,
} from "@/lib/doc2mcp/mcp-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  if (!query.trim()) {
    return mcpError("missing_query", 400);
  }

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

  return handleMcpSearch(resolved.pages, query);
}
