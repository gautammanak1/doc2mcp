import { asi1GenerateText } from "@/lib/asi1/client";
import type {
  ApiEndpoint,
  CompressedTool,
  CrawlResult,
  ProcessingLog,
  QualityScore,
} from "@/types/platform";
import { generateLlmsTxt } from "../generators/llms-txt";
import { compressApiToTools } from "./tool-compression";

function buildAnalysisPrompt(crawlResults: CrawlResult[]): string {
  const docsSummary = crawlResults
    .map(
      (r) =>
        `## ${r.title} (${r.type})\nURL: ${r.url}\n${r.content.slice(0, 2000)}`
    )
    .join("\n\n");

  return `You are an expert API documentation analyst. Analyze the following documentation and extract structured API information and quality scores.

Return ONLY valid JSON with this structure:
{
  "summary": "Brief platform summary",
  "endpoints": [{"method": "GET", "path": "/resource", "summary": "...", "description": "...", "auth": "bearer|api_key|oauth|none", "tags": ["tag"]}],
  "authPatterns": [{"type": "bearer", "description": "..."}],
  "workflows": [{"name": "...", "steps": ["step1", "step2"]}],
  "useCases": ["use case 1", "use case 2"],
  "qualityScore": {
    "docsScore": 85,
    "authConfidence": 90,
    "workflowConfidence": 75,
    "mcpScore": 80,
    "explanation": "Docs are very well structured with detailed paths. Auth pattern is standard OAuth2. Workflows were successfully inferred based on tutorials."
  }
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
  qualityScore: QualityScore;
  tokenUsage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
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
    qualityScore?: QualityScore;
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

  const defaultQualityScore: QualityScore = {
    docsScore: Math.min(60 + crawlResults.length * 5, 95),
    authConfidence: endpoints.some((e) => e.auth && e.auth !== "none") ? 90 : 80,
    workflowConfidence: parsed.workflows && parsed.workflows.length > 0 ? 85 : 70,
    mcpScore: compressedTools.length > 0 ? 88 : 75,
    explanation: "Automatically evaluated quality based on docs content and endpoint structure.",
  };

  const qualityScore: QualityScore = parsed.qualityScore ?? defaultQualityScore;

  return {
    summary: parsed.summary ?? "",
    endpoints,
    authPatterns: parsed.authPatterns ?? [],
    workflows: parsed.workflows ?? [],
    useCases: parsed.useCases ?? [],
    compressedTools,
    llmsTxt,
    qualityScore,
    tokenUsage: usage,
  };
}
