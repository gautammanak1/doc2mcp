import { asi1GenerateText } from "@/lib/asi1/client";
import {
  mcpError,
  mcpJson,
  resolveMcpProject,
} from "@/lib/doc2mcp/mcp-api";
import { searchDocs } from "@/lib/doc2mcp/docs-index";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const body = (await request.json()) as { question?: string };
  const question = body.question?.trim();

  if (!question) {
    return mcpError("missing_question", 400);
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

  const hits = searchDocs(resolved.pages, question, 12);
  const context = hits
    .map(
      (h) =>
        `### ${h.page.title}\n${h.page.url}\n\n${h.page.content.slice(0, 12_000)}`
    )
    .join("\n\n---\n\n");

  const { text } = await asi1GenerateText([
    {
      role: "system",
      content:
        "You are reading the official documentation excerpts for a developer. When code examples, configuration, or relevant context are present in the excerpts, answer fully and include the code verbatim in fenced code blocks. Do not say 'the documentation does not contain' unless none of the excerpts mention the topic at all. Always cite page titles and URLs.",
    },
    {
      role: "user",
      content: `Question: ${question}\n\nDocumentation:\n${context || "No matching pages."}`,
    },
  ]);

  return mcpJson({
    question,
    answer: text,
    sources: hits.map((h) => ({ title: h.page.title, url: h.page.url })),
  });
}
