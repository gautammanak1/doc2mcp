import { resolveMcpProject } from "@/lib/doc2mcp/mcp-api";
import { runDocMcpTool } from "@/lib/doc2mcp/mcp-tools-runtime";
import { DOC_MCP_TOOLS } from "@/services/mcp/doc-tools";

const PROTOCOL_VERSION = "2025-06-18";

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc?: "2.0";
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
};

function rpcSuccess(id: JsonRpcId, result: unknown) {
  return Response.json({ jsonrpc: "2.0", id, result });
}

function rpcError(
  id: JsonRpcId,
  code: number,
  message: string,
  status = 200
) {
  return Response.json(
    {
      jsonrpc: "2.0",
      id,
      error: { code, message },
    },
    { status }
  );
}

function rpcHttpError(status: number, code: number, message: string) {
  return Response.json(
    {
      jsonrpc: "2.0",
      id: null,
      error: { code, message },
    },
    { status }
  );
}

export async function GET() {
  return new Response(
    "doc2mcp HTTP MCP — use POST with JSON-RPC 2.0 (initialize, tools/list, tools/call)",
    { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } }
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  let body: JsonRpcRequest;
  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return rpcHttpError(400, -32_700, "Parse error: invalid JSON");
  }

  const id: JsonRpcId = body.id ?? null;
  const method = body.method;
  const rpcParams = body.params ?? {};

  if (!method) {
    return rpcError(id, -32_600, "Missing method", 400);
  }

  if (method === "initialize") {
    return rpcSuccess(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {
        tools: { listChanged: false },
      },
      serverInfo: {
        name: "doc2mcp",
        version: "1.0.0",
      },
    });
  }

  if (method === "notifications/initialized" || method === "initialized") {
    return new Response(null, { status: 204 });
  }

  if (method === "ping") {
    return rpcSuccess(id, {});
  }

  if (method === "tools/list") {
    return rpcSuccess(id, {
      tools: DOC_MCP_TOOLS,
    });
  }

  if (method === "tools/call") {
    const toolName =
      typeof (rpcParams as { name?: unknown }).name === "string"
        ? ((rpcParams as { name: string }).name)
        : "";
    const toolArgs =
      (rpcParams as { arguments?: Record<string, unknown> }).arguments ?? {};

    if (!toolName) {
      return rpcError(id, -32_602, "Missing tool name in params");
    }

    const resolved = await resolveMcpProject(request, projectId);
    if ("error" in resolved) {
      if (resolved.error === "not_found") {
        return rpcHttpError(404, -32_001, "Project not found");
      }
      if (resolved.error === "not_ready") {
        return rpcHttpError(409, -32_002, "Project is not ready yet");
      }
      return rpcHttpError(401, -32_003, "Unauthorized: missing or invalid token");
    }

    try {
      const result = await runDocMcpTool(toolName, toolArgs, {
        project: { name: resolved.project.name, sourceUrl: resolved.project.sourceUrl },
        pages: resolved.pages,
        artifacts: resolved.artifacts,
      });
      return rpcSuccess(id, result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Tool execution failed";
      return rpcSuccess(id, {
        content: [{ type: "text", text: message }],
        isError: true,
      });
    }
  }

  return rpcError(id, -32_601, `Method not found: ${method}`);
}
