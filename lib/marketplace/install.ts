import type { ProjectArtifacts } from "@/types/platform";

export type InstallTargets = {
  serverName: string;
  endpointUrl: string;
  /** Pretty mcp.json-shaped config for Cursor (copy/paste fallback). */
  cursorConfigJson: string;
  /** Pretty config for VS Code `mcp.json` (copy/paste fallback). */
  vscodeConfigJson: string;
  /** `cursor://` one-click deeplink. */
  cursorDeeplink: string;
  /** VS Code one-click redirect link. */
  vscodeDeeplink: string;
  /** VS Code Insiders one-click redirect link. */
  vscodeInsidersDeeplink: string;
};

type ServerEntry = {
  name: string;
  url: string;
  headers: Record<string, string>;
};

function encodeBase64(input: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "utf8").toString("base64");
  }
  // Edge/browser fallback — handles non-ASCII safely.
  return btoa(String.fromCharCode(...new TextEncoder().encode(input)));
}

function readArtifacts(value: unknown): ProjectArtifacts | null {
  if (value && typeof value === "object") {
    return value as ProjectArtifacts;
  }
  return null;
}

function extractServerEntry(
  artifacts: ProjectArtifacts | null
): ServerEntry | null {
  const config = artifacts?.mcpConfig;
  if (!config) {
    return null;
  }
  const name = config.name || "doc2mcp";
  const servers = config.cursorConfig?.mcpServers as
    | Record<string, { url?: string; headers?: Record<string, string> }>
    | undefined;
  const entry = servers?.[name];
  if (!entry?.url) {
    return null;
  }
  return {
    name,
    url: entry.url,
    headers: entry.headers ?? {},
  };
}

/**
 * Build one-click install links + copy-paste configs for Cursor and VS
 * Code from a project's stored MCP config.
 *
 * NOTE: the resulting links embed the project's bearer token (that's what
 * makes "one-click install" actually work). Only call this for projects
 * that are intentionally public on the marketplace.
 */
export function buildInstallTargets(
  artifactsValue: unknown
): InstallTargets | null {
  const server = extractServerEntry(readArtifacts(artifactsValue));
  if (!server) {
    return null;
  }
  const { name, url, headers } = server;

  // Cursor: same shape as mcp.json transport config, base64-encoded.
  const cursorInner = { url, headers };
  const cursorB64 = encodeBase64(JSON.stringify(cursorInner));
  const cursorDeeplink = `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(
    name
  )}&config=${encodeURIComponent(cursorB64)}`;

  // VS Code: URL-encoded JSON config with explicit http transport.
  const vscodeConfig = { type: "http", url, headers };
  const vscodeJson = JSON.stringify(vscodeConfig);
  const vscodeBase = `https://insiders.vscode.dev/redirect/mcp/install?name=${encodeURIComponent(
    name
  )}&config=${encodeURIComponent(vscodeJson)}`;

  return {
    serverName: name,
    endpointUrl: url,
    cursorConfigJson: JSON.stringify(
      { mcpServers: { [name]: cursorInner } },
      null,
      2
    ),
    vscodeConfigJson: JSON.stringify(
      { servers: { [name]: vscodeConfig } },
      null,
      2
    ),
    cursorDeeplink,
    vscodeDeeplink: vscodeBase,
    vscodeInsidersDeeplink: `${vscodeBase}&quality=insiders`,
  };
}
