import { asi1GenerateText } from "@/lib/asi1/client";
import { chunkPages, searchChunks } from "@/lib/doc2mcp/chunks";
import {
  buildDocsIndex,
  buildFullDocsMarkdown,
  getDocPage,
} from "@/lib/doc2mcp/docs-index";
import { isWebSearchEnabled, webSearch } from "@/lib/search/providers";
import type { CrawlResult, ProjectArtifacts } from "@/types/platform";

export type DocMcpContext = {
  project: { name: string; sourceUrl: string | null };
  pages: CrawlResult[];
  artifacts: ProjectArtifacts | null;
};

export type DocMcpToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

function textOk(value: unknown): DocMcpToolResult {
  const text =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return { content: [{ type: "text" as const, text }] };
}

function textErr(message: string): DocMcpToolResult {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

/**
 * Per-request chunk cache so we don't re-split markdown on every tool call
 * within the same context. Keyed by the pages array identity.
 */
const chunkCache = new WeakMap<CrawlResult[], ReturnType<typeof chunkPages>>();

function getChunks(ctx: DocMcpContext) {
  let chunks = chunkCache.get(ctx.pages);
  if (!chunks) {
    chunks = chunkPages(ctx.pages);
    chunkCache.set(ctx.pages, chunks);
  }
  return chunks;
}

export async function runDocMcpTool(
  name: string,
  args: Record<string, unknown>,
  ctx: DocMcpContext
): Promise<DocMcpToolResult> {
  switch (name) {
    case "list_documentation_pages":
      return textOk({
        pages: buildDocsIndex(ctx.pages),
        total: ctx.pages.length,
      });

    case "get_documentation_page": {
      const ref =
        typeof args.url === "string" && args.url
          ? args.url
          : typeof args.id === "string"
            ? args.id
            : "";
      if (!ref) {
        return textErr("Provide either 'url' or 'id'.");
      }
      const page =
        getDocPage(ctx.pages, { url: ref }) ??
        getDocPage(ctx.pages, { id: ref });
      if (!page) {
        return textErr(`Page not found: ${ref}`);
      }
      return textOk({
        title: page.title,
        url: page.url,
        type: page.type,
        content: page.content,
      });
    }

    case "search_documentation": {
      const query = String(args.query ?? "").trim();
      if (!query) {
        return textErr("Provide a 'query' string.");
      }
      const limit =
        typeof args.limit === "number" && args.limit > 0
          ? Math.min(args.limit, 30)
          : 10;

      const chunks = getChunks(ctx);
      const hits = searchChunks(chunks, query, limit);
      return textOk({
        query,
        results: hits.map((h) => ({
          title: h.chunk.pageTitle,
          heading: h.chunk.heading,
          breadcrumbs: h.chunk.breadcrumbs,
          url: h.chunk.pageUrl,
          chunkId: h.chunk.id,
          type: h.chunk.type,
          score: h.score,
          snippet: h.snippet,
        })),
      });
    }

    case "get_documentation_overview":
      return textOk({
        name: ctx.project.name,
        sourceUrl: ctx.project.sourceUrl,
        pageCount: ctx.pages.length,
        chunkCount: getChunks(ctx).length,
        index: buildDocsIndex(ctx.pages),
        llmsTxt: ctx.artifacts?.llmsTxt ?? "",
      });

    case "read_full_documentation": {
      const maxPages =
        typeof args.maxPages === "number" && args.maxPages > 0
          ? args.maxPages
          : undefined;
      const slice = maxPages ? ctx.pages.slice(0, maxPages) : ctx.pages;
      return textOk(buildFullDocsMarkdown(slice, ctx.project.sourceUrl ?? ""));
    }

    case "ask_documentation": {
      const question = String(args.question ?? "").trim();
      if (!question) {
        return textErr("Provide a 'question'.");
      }

      const chunks = getChunks(ctx);
      const hits = searchChunks(chunks, question, 16);

      const localExcerpts = hits
        .map(
          (h) =>
            `### ${h.chunk.breadcrumbs}\n${h.chunk.pageUrl}\n\n${h.chunk.content.slice(0, 4500)}`
        )
        .join("\n\n---\n\n");

      let webBlock = "";
      const webSources: Array<{ title: string; url: string }> = [];
      const localContentLen = localExcerpts.replace(/\s+/g, "").length;

      if (isWebSearchEnabled() && localContentLen < 3000) {
        let host: string | undefined;
        try {
          host = ctx.project.sourceUrl
            ? new URL(ctx.project.sourceUrl).hostname
            : undefined;
        } catch {
          host = undefined;
        }
        const webHits = await webSearch(question, {
          site: host,
          limit: 6,
        });
        if (webHits.length > 0) {
          webBlock = webHits
            .map((h) => `### ${h.title}\n${h.url}\n\n${h.snippet}`)
            .join("\n\n---\n\n");
          for (const h of webHits) {
            webSources.push({ title: h.title, url: h.url });
          }
        }
      }

      const documentation =
        [localExcerpts, webBlock].filter(Boolean).join("\n\n---\n\n") ||
        "No matching pages.";

      const { text } = await asi1GenerateText([
        {
          role: "system",
          content:
            "You are reading the official documentation excerpts for a developer. The excerpts are individual sections from the docs, not whole pages. When code examples, configuration, or relevant context are present, answer fully and include the code verbatim in fenced code blocks. Do not say 'the documentation does not contain' unless none of the excerpts mention the topic at all. Always cite page titles and URLs.",
        },
        {
          role: "user",
          content: `Question: ${question}\n\nDocumentation:\n${documentation}`,
        },
      ]);

      const seenSources = new Set<string>();
      const allSources: Array<{ title: string; url: string }> = [];
      for (const h of hits) {
        if (seenSources.has(h.chunk.pageUrl)) {
          continue;
        }
        seenSources.add(h.chunk.pageUrl);
        allSources.push({ title: h.chunk.pageTitle, url: h.chunk.pageUrl });
      }
      for (const s of webSources) {
        if (seenSources.has(s.url)) {
          continue;
        }
        seenSources.add(s.url);
        allSources.push(s);
      }

      return textOk({
        question,
        answer: text,
        sources: allSources,
      });
    }

    default:
      return textErr(`Unknown tool: ${name}`);
  }
}
