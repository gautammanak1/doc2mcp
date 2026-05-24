import { createMcpServerRecord, updatePlatformProject } from "@/lib/db/queries";
import { createMcpProjectToken, hashMcpToken } from "@/lib/doc2mcp/mcp-access";
import type {
  ProcessingLog,
  ProjectArtifacts,
  SourceType,
} from "@/types/platform";
import { analyzeDocumentation } from "../ai/understanding";
import { buildApiGraph } from "../graph/builder";
import { crawlDocsSource } from "../ingestion/crawler";
import {
  generateClaudeDesktopConfig,
  generateCursorMcpJson,
  generateMcpConfig,
  generateMcpServerCode,
} from "../mcp/generator";

export async function processProjectPipeline({
  projectId,
  userId,
  sourceUrl,
  sourceType,
  projectName,
}: {
  projectId: string;
  userId: string;
  sourceUrl: string;
  sourceType: SourceType;
  projectName: string;
}) {
  const logs: ProcessingLog[] = [];
  const addLog = (
    message: string,
    level: ProcessingLog["level"] = "info",
    phase?: string
  ) => {
    const entry: ProcessingLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      message,
      phase,
    };
    logs.push(entry);
    return entry;
  };

  try {
    await updatePlatformProject({
      id: projectId,
      userId,
      data: { status: "crawling", logs },
    });

    addLog("Starting documentation crawl...", "info", "crawl");
    const crawlResults = await crawlDocsSource(sourceUrl, sourceType);
    addLog(`Crawled ${crawlResults.length} pages`, "success", "crawl");

    await updatePlatformProject({
      id: projectId,
      userId,
      data: { status: "analyzing", crawlData: crawlResults, logs },
    });

    addLog("Analyzing documentation with ASI1...", "info", "ai");
    const analysis = await analyzeDocumentation(
      crawlResults,
      projectName,
      sourceUrl,
      (log) => logs.push(log)
    );

    await updatePlatformProject({
      id: projectId,
      userId,
      data: { status: "generating", logs },
    });

    addLog("Building documentation MCP server...", "info", "mcp");
    const mcpAccessToken = createMcpProjectToken();
    const mcpTokenHash = hashMcpToken(mcpAccessToken);

    const mcpConfig = generateMcpConfig({
      projectId,
      sourceUrl,
      projectName,
      mcpAccessToken,
      compressedTools: analysis.compressedTools,
    });

    addLog("Building API graph visualization...", "info", "graph");
    const { nodes, edges } = buildApiGraph(
      analysis.endpoints,
      analysis.authPatterns
    );

    const mcpServerCode = generateMcpServerCode(mcpConfig);

    const artifacts: ProjectArtifacts = {
      endpoints: analysis.endpoints,
      compressedTools: analysis.compressedTools,
      mcpConfig,
      llmsTxt: analysis.llmsTxt,
      sdkTypescript: "",
      sdkPython: "",
      graphNodes: nodes,
      graphEdges: edges,
      mcpAccessToken,
      mcpTokenHash,
      docsPageCount: crawlResults.length,
      qualityScore: analysis.qualityScore,
      cursorConfig: {
        mcp: JSON.parse(generateCursorMcpJson(mcpConfig)),
        claude: JSON.parse(generateClaudeDesktopConfig(mcpConfig)),
        serverCode: mcpServerCode,
      },
    };

    await createMcpServerRecord({
      projectId,
      userId,
      name: mcpConfig.name,
      config: mcpConfig,
      tools: mcpConfig.tools,
    });

    addLog(
      `Ready — ${crawlResults.length} pages in MCP. Copy token from result page.`,
      "success",
      "done"
    );

    await updatePlatformProject({
      id: projectId,
      userId,
      data: {
        status: "ready",
        artifacts,
        logs,
        tokenUsage: analysis.tokenUsage,
      },
    });

    return { success: true, artifacts };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    addLog(`Pipeline failed: ${message}`, "error", "error");
    await updatePlatformProject({
      id: projectId,
      userId,
      data: { status: "error", logs },
    });
    throw error;
  }
}
