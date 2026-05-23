import { asi1GenerateText } from "@/lib/asi1/client";
import type {
  ApiEndpoint,
  CompressedTool,
  CrawlResult,
  ProcessingLog,
} from "@/types/platform";
import { generateLlmsTxt } from "../generators/llms-txt";
import { compressApiToTools } from "./tool-compression";

function buildAnalysisPrompt(crawlResults: CrawlResult[]): string {
  const docsSummary = crawlResults
    .map((r) => `## ${r.title} (${r.type})\nURL: ${r.url}\n${r.content.slice(0, 2000)}`)
    .join("\n\n");

  return `You are an expert API documentation analyst. Analyze the following documentation and extract structured API information.

Return ONLY valid JSON with this structure:
{
  "summary": "Brief platform summary",
  "endpoints": [{"method": "GET", "path": "/resource", "summary": "...", "description": "...", "auth": "bearer|api_key|oauth|none", "tags": ["tag"]}],
  "authPatterns": [{"type": "bearer", "description": "..."}],
  "workflows": [{"name": "...", "steps": ["step1", "step2"]}],
  "useCases": ["use case 1", "use case 2"]
}

Documentation:
${docsSummary}`;
}

export type AnalysisResult = {
  summary: string;
  endpoints: ApiEndpoint[];
  authPatterns: Array<{ type: string; description: string }>;
  workflows: Array<{ name: string; steps: string[] }>;
  useCases: string[];
  compressedTools: CompressedTool[];
  llmsTxt: string;
  tokenUsage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

export async function analyzeDocumentation(
  crawlResults: CrawlResult[],
  projectName: string,
  sourceUrl: string,
  onLog?: (log: ProcessingLog) => void
): Promise<AnalysisResult> {
  const log = (message: string, level: ProcessingLog["level"] = "info") => {
    onLog?.({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      message,
      phase: "ai-understanding",
    });
  };

  log("Sending documentation to ASI1 for analysis...");

  const { text, usage } = await asi1GenerateText([
    {
      role: "system",
      content:
        "You are a world-class API architect. Extract precise API structures from documentation. Always return valid JSON only.",
    },
    { role: "user", content: buildAnalysisPrompt(crawlResults) },
  ]);

  log("Parsing AI analysis results...", "success");

  let parsed: {
    summary?: string;
    endpoints?: ApiEndpoint[];
    authPatterns?: Array<{ type: string; description: string }>;
    workflows?: Array<{ name: string; steps: string[] }>;
    useCases?: string[];
  };

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch?.[0] ?? "{}");
  } catch {
    parsed = {
      summary: "API documentation analyzed",
      endpoints: [],
      authPatterns: [],
      workflows: [],
      useCases: [],
    };
  }

  const endpoints: ApiEndpoint[] = (parsed.endpoints ?? []).map((e, i) => ({
    id: `endpoint-${i}`,
    method: e.method ?? "GET",
    path: e.path ?? "/",
    summary: e.summary,
    description: e.description,
    auth: e.auth as ApiEndpoint["auth"],
    tags: e.tags,
  }));

  log(`Detected ${endpoints.length} API endpoints`, "success");
  log("Compressing API into AI-native tools...");

  const compressedTools = await compressApiToTools(endpoints, projectName);

  log(`Generated ${compressedTools.length} compressed tools`, "success");
  log("Generating llms.txt for agent consumption...");

  const llmsTxt = generateLlmsTxt({
    name: projectName,
    summary: parsed.summary ?? "",
    sourceUrl,
    pages: crawlResults,
    endpoints,
    tools: compressedTools,
    useCases: parsed.useCases ?? [],
  });

  return {
    summary: parsed.summary ?? "",
    endpoints,
    authPatterns: parsed.authPatterns ?? [],
    workflows: parsed.workflows ?? [],
    useCases: parsed.useCases ?? [],
    compressedTools,
    llmsTxt,
    tokenUsage: usage,
  };
}
