import { getPlatformProjectForMcp } from "@/lib/db/queries";
import {
  buildDocsIndex,
  buildFullDocsMarkdown,
  getDocPage,
  searchDocs,
} from "@/lib/doc2mcp/docs-index";
import { readMcpAuthToken, verifyMcpToken } from "@/lib/doc2mcp/mcp-access";
import type { CrawlResult, ProjectArtifacts } from "@/types/platform";

export async function resolveMcpProject(request: Request, projectId: string) {
  const token = readMcpAuthToken(request);
  const project = await getPlatformProjectForMcp({ id: projectId });

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

  const pages = (project.crawlData as CrawlResult[] | null) ?? [];

  return { project, pages, artifacts };
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
