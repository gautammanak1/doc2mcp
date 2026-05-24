import { getDoc2McpBaseUrl } from "@/lib/doc2mcp/app-url";
import { deriveMcpServerSlug } from "@/lib/doc2mcp/naming";
import type { CompressedTool, McpServerConfig } from "@/types/platform";
import { DOC_MCP_TOOLS } from "./doc-tools";

export type McpGeneratorOptions = {
  projectId: string;
  sourceUrl: string;
  projectName?: string;
  mcpAccessToken: string;
  compressedTools?: CompressedTool[];
};

function resolveServerSlug(options: McpGeneratorOptions): string {
  const fromUrl = deriveMcpServerSlug(options.sourceUrl);
  if (fromUrl && fromUrl !== "docs") {
    return fromUrl;
  }
  if (options.projectName) {
    return options.projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  return fromUrl;
}

function buildMcpServerEntry(options: McpGeneratorOptions) {
  const baseUrl = getDoc2McpBaseUrl();
  return {
    url: `${baseUrl}/api/mcp/${options.projectId}/mcp`,
    headers: {
      Authorization: `Bearer ${options.mcpAccessToken}`,
    },
  };
}

export function generateMcpConfig(
  options: McpGeneratorOptions
): McpServerConfig {
  const serverSlug = resolveServerSlug(options) || "docs";
  const serverEntry = buildMcpServerEntry(options);

  const customTools = (options.compressedTools ?? []).map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: (t.parameters as Record<string, unknown>) ?? {
      type: "object",
      properties: {},
    },
  }));

  const tools = [...DOC_MCP_TOOLS, ...customTools];

  return {
    name: serverSlug,
    version: "1.0.0",
    tools,
    projectId: options.projectId,
    sourceUrl: options.sourceUrl,
    cursorConfig: {
      mcpServers: {
        [serverSlug]: serverEntry,
      },
    },
    claudeConfig: {
      mcpServers: {
        [serverSlug]: serverEntry,
      },
    },
  };
}

export function generateMcpServerCode(config: McpServerConfig): string {
  return `// doc2mcp ${config.name}\n// Remote HTTP MCP — no local install needed.\n// Configure Cursor with the JSON shown on the convert page.\n`;
}

export function generateCursorMcpJson(config: McpServerConfig): string {
  return JSON.stringify(config.cursorConfig ?? {}, null, 2);
}

export function generateClaudeDesktopConfig(config: McpServerConfig): string {
  return JSON.stringify(config.claudeConfig ?? {}, null, 2);
}
