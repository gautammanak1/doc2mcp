import {
  getPlatformProjectForMcp,
  getPlatformProjectMetaForMcp,
  recordMcpHit,
} from "@/lib/db/queries";
import type { PlatformProject } from "@/lib/db/schema";
import {
  buildDocsIndex,
  buildFullDocsMarkdown,
  getDocPage,
  searchDocs,
} from "@/lib/doc2mcp/docs-index";
import { readMcpAuthToken, verifyMcpToken } from "@/lib/doc2mcp/mcp-access";
import type { CrawlResult, ProjectArtifacts } from "@/types/platform";

export type ResolveMcpProjectOptions = {
  /**
   * Skip loading the multi-megabyte `crawlData` JSON column. Only the
   * project metadata + artifacts are returned, so `pages` will be `[]`.
   *
   * Use for `tools/list` and any other endpoint that doesn't need the
   * crawled pages — saves a 4-8 MB JSON parse per request.
   */
  withPages?: boolean;
};

export async function resolveMcpProject(
  request: Request,
  projectId: string,
  options: ResolveMcpProjectOptions = {}
) {
  const { withPages = true } = options;
  const token = readMcpAuthToken(request);
  const project = withPages
    ? await getPlatformProjectForMcp({ id: projectId })
    : await getPlatformProjectMetaForMcp({ id: projectId });

  if (!project) {
    return { error: "not_found" as const };
  }

  const artifacts = project.artifacts as ProjectArtifacts | null;
  const storedHash = artifacts?.mcpTokenHash;

  if (!verifyMcpToken(token, storedHash)) {
    return { error: "unauthorized" as const };
  }

  if (project.status !== "ready") {
    return { error: "not_ready" as const };
  }

  const pages = withPages
    ? ((project.crawlData as CrawlResult[] | null) ?? [])
    : [];

  return { project, pages, artifacts };
}

/**
 * Fire-and-forget attribution of an MCP hit to developer vs company traffic.
 * Never awaited by callers so analytics can't slow or break an MCP response.
 */
export function attributeMcpHit(project: {
  id: string;
  ownerType: PlatformProject["ownerType"];
  teamId: string | null;
}): void {
  recordMcpHit({
    projectId: project.id,
    ownerType: project.ownerType,
    teamId: project.teamId,
  }).catch(() => {
    // best-effort tracking; never block an MCP response
  });
}

export function mcpJson(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function mcpError(code: string, status: number): Response {
  return mcpJson({ error: code }, status);
}

export function handleMcpOverview(
  project: { sourceUrl: string | null; name: string },
  pages: CrawlResult[],
  artifacts: ProjectArtifacts | null
) {
  return mcpJson({
    name: project.name,
    sourceUrl: project.sourceUrl,
    pageCount: pages.length,
    index: buildDocsIndex(pages),
    llmsTxt: artifacts?.llmsTxt ?? "",
    summary: artifacts?.llmsTxt?.slice(0, 500) ?? "",
    fullMarkdown: buildFullDocsMarkdown(pages, project.sourceUrl ?? ""),
  });
}

export function handleMcpPages(pages: CrawlResult[]) {
  return mcpJson({ pages: buildDocsIndex(pages) });
}

export function handleMcpPageGet(pages: CrawlResult[], ref: string) {
  const page =
    getDocPage(pages, { url: ref }) ?? getDocPage(pages, { id: ref });
  if (!page) {
    return mcpError("page_not_found", 404);
  }
  return mcpJson({ page });
}

export function handleMcpSearch(pages: CrawlResult[], query: string) {
  const results = searchDocs(pages, query);
  return mcpJson({
    query,
    results: results.map((r) => ({
      title: r.page.title,
      url: r.page.url,
      type: r.page.type,
      score: r.score,
      snippet: r.snippet,
    })),
  });
}

export function handleMcpFull(
  pages: CrawlResult[],
  sourceUrl: string,
  maxPages?: number
) {
  const slice = maxPages ? pages.slice(0, maxPages) : pages;
  return mcpJson({
    markdown: buildFullDocsMarkdown(slice, sourceUrl),
    pageCount: slice.length,
    totalPages: pages.length,
  });
}
