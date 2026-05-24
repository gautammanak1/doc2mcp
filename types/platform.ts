export type ProjectStatus =
  | "pending"
  | "crawling"
  | "analyzing"
  | "generating"
  | "ready"
  | "error";

export type SourceType =
  | "url"
  | "github"
  | "markdown"
  | "openapi"
  | "postman"
  | "html";

export type AuthType = "api_key" | "oauth" | "bearer" | "none" | "env";

export type ApiEndpoint = {
  id: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  auth?: AuthType;
  tags?: string[];
};

export type CompressedTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  endpoints: string[];
  /** 0..100 confidence assigned by the MCP correctness layer. */
  confidence?: number;
};

export type McpToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

export type McpServerConfig = {
  name: string;
  version: string;
  tools: McpToolDefinition[];
  projectId?: string;
  sourceUrl?: string;
  cursorConfig?: Record<string, unknown>;
  claudeConfig?: Record<string, unknown>;
};

export type ApiGraphNode = {
  id: string;
  type: "endpoint" | "resource" | "auth" | "workflow";
  label: string;
  data: Record<string, unknown>;
  position: { x: number; y: number };
};

export type ApiGraphEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
};

export type WorkflowNode = {
  id: string;
  type: "api" | "ai" | "condition" | "retry" | "memory";
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
};

export type CrawlResult = {
  url: string;
  title: string;
  content: string;
  type: "page" | "api" | "auth" | "workflow";
  /** SHA-256 of raw content. Used for incremental sync / changed-page detection. */
  contentHash?: string;
  /** ISO timestamp of crawl. */
  crawledAt?: string;
};

export type QualityScore = {
  docsScore: number;
  authConfidence: number;
  workflowConfidence: number;
  mcpScore: number;
  explanation?: string;
};

export type GenerationReport = {
  source: {
    discoveredSpecUrl?: string;
    extractionMode: "openapi" | "ai-html";
  };
  endpoints: {
    inputCount: number;
    uniqueCount: number;
    collapsed: number;
  };
  tools: {
    total: number;
    kept: number;
    dropped: number;
    averageConfidence: number;
  };
  smoke: {
    passed: number;
    failed: number;
  };
  issues: Array<{
    toolName: string;
    severity: "error" | "warning";
    code: string;
    message: string;
  }>;
};

export type ProjectArtifacts = {
  endpoints: ApiEndpoint[];
  compressedTools: CompressedTool[];
  mcpConfig: McpServerConfig | null;
  llmsTxt: string;
  sdkTypescript: string;
  sdkPython: string;
  graphNodes: ApiGraphNode[];
  graphEdges: ApiGraphEdge[];
  cursorConfig: Record<string, unknown>;
  /** Shown once on convert page — Cursor MCP uses this, not third-party API keys. */
  mcpAccessToken?: string;
  mcpTokenHash?: string;
  docsPageCount?: number;
  qualityScore?: QualityScore;
  generationReport?: GenerationReport;
};

export type ProcessingLog = {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
  phase?: string;
};
