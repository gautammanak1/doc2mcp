import { buildInstallTargets } from "@/lib/marketplace/install";
import { generateMcpExportBundle } from "@/services/mcp/exports";
import type { McpServerConfig, ProjectArtifacts } from "@/types/platform";

export type CliInstallBundle = {
  serverName: string;
  endpointUrl: string;
  mcpToken: string;
  cursor: {
    pathHint: "~/.cursor/mcp.json or ./.cursor/mcp.json";
    config: Record<string, unknown>;
  };
  vscode: {
    pathHint: "./.vscode/mcp.json";
    config: Record<string, unknown>;
  };
  windsurf: {
    pathHint: "~/.codeium/windsurf/mcp_config.json";
    config: Record<string, unknown>;
  };
  claude: {
    pathHint: "Claude Desktop config (platform-specific)";
    config: Record<string, unknown>;
  };
};

function readArtifacts(value: unknown): ProjectArtifacts | null {
  if (value && typeof value === "object") {
    return value as ProjectArtifacts;
  }
  return null;
}

export function buildCliInstallBundle(
  artifactsValue: unknown
): CliInstallBundle | null {
  const artifacts = readArtifacts(artifactsValue);
  const mcpConfig = artifacts?.mcpConfig as McpServerConfig | undefined;
  if (!mcpConfig) {
    return null;
  }

  const mcpToken = artifacts?.mcpAccessToken;
  if (!mcpToken) {
    return null;
  }

  const exportBundle = generateMcpExportBundle({ config: mcpConfig });
  const installTargets = buildInstallTargets(artifacts);
  if (!installTargets) {
    return null;
  }

  const cursorConfig = JSON.parse(installTargets.cursorConfigJson) as Record<
    string,
    unknown
  >;
  const vscodeConfig = JSON.parse(installTargets.vscodeConfigJson) as Record<
    string,
    unknown
  >;

  const windsurfArtifact = exportBundle.artifacts.find(
    (item) => item.id === "windsurf"
  );
  const claudeArtifact = exportBundle.artifacts.find(
    (item) => item.id === "claude-desktop"
  );

  return {
    serverName: installTargets.serverName,
    endpointUrl: installTargets.endpointUrl,
    mcpToken,
    cursor: {
      pathHint: "~/.cursor/mcp.json or ./.cursor/mcp.json",
      config: cursorConfig,
    },
    vscode: {
      pathHint: "./.vscode/mcp.json",
      config: vscodeConfig,
    },
    windsurf: {
      pathHint: "~/.codeium/windsurf/mcp_config.json",
      config: windsurfArtifact
        ? (JSON.parse(windsurfArtifact.content) as Record<string, unknown>)
        : {},
    },
    claude: {
      pathHint: "Claude Desktop config (platform-specific)",
      config: claudeArtifact
        ? (JSON.parse(claudeArtifact.content) as Record<string, unknown>)
        : {},
    },
  };
}
