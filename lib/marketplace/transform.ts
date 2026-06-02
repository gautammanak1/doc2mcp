import type {
  CompressedTool,
  ProjectArtifacts,
  SourceType,
} from "@/types/platform";
import type {
  MarketplaceMcp,
  MarketplaceMcpDetail,
  MarketplaceTool,
} from "./types";

type ProjectRow = {
  id: string;
  name: string;
  sourceUrl: string | null;
  sourceType: SourceType;
  artifacts: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
  ownerName: string | null;
};

function ownerDisplay(name: string | null): string {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Community";
}

function iso(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function readArtifacts(value: unknown): ProjectArtifacts | null {
  if (value && typeof value === "object") {
    return value as ProjectArtifacts;
  }
  return null;
}

function toolCountOf(artifacts: ProjectArtifacts | null): number {
  return artifacts?.compressedTools?.length ?? 0;
}

export function toMarketplaceMcp(project: ProjectRow): MarketplaceMcp {
  const artifacts = readArtifacts(project.artifacts);
  return {
    id: project.id,
    name: project.name,
    sourceUrl: project.sourceUrl,
    sourceType: project.sourceType,
    ownerName: ownerDisplay(project.ownerName),
    toolCount: toolCountOf(artifacts),
    pageCount: artifacts?.docsPageCount ?? 0,
    mcpScore: artifacts?.qualityScore?.mcpScore ?? null,
    createdAt: iso(project.createdAt),
    updatedAt: iso(project.updatedAt),
  };
}

export function toMarketplaceMcpDetail(
  project: ProjectRow
): MarketplaceMcpDetail {
  const base = toMarketplaceMcp(project);
  const artifacts = readArtifacts(project.artifacts);
  const compressed: CompressedTool[] = artifacts?.compressedTools ?? [];
  const tools: MarketplaceTool[] = compressed.map((tool) => ({
    name: tool.name,
    description: tool.description,
  }));

  const summary = (artifacts?.llmsTxt ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);

  return {
    ...base,
    summary,
    tools,
    docsScore: artifacts?.qualityScore?.docsScore ?? null,
    endpointCount: artifacts?.endpoints?.length ?? 0,
  };
}
