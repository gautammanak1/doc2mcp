import { createHash, randomBytes } from "node:crypto";

export function createMcpProjectToken(): string {
  return `d2mcp_${randomBytes(24).toString("base64url")}`;
}

export function hashMcpToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyMcpToken(
  provided: string | null,
  storedHash: string | undefined
): boolean {
  if (!provided || !storedHash) {
    return false;
  }
  return hashMcpToken(provided) === storedHash;
}

export function readMcpAuthToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  const xToken = request.headers.get("x-doc2mcp-token");
  if (xToken) {
    return xToken;
  }
  try {
    const url = new URL(request.url);
    return url.searchParams.get("token");
  } catch {
    return null;
  }
}
