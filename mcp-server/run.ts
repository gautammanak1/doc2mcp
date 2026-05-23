#!/usr/bin/env node
/**
 * doc2mcp stdio MCP — full crawled docs via platform API (no third-party API keys).
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = (process.env.DOC2MCP_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);
const PROJECT_ID = process.env.DOC2MCP_PROJECT_ID ?? "";
const PROJECT_TOKEN = process.env.DOC2MCP_PROJECT_TOKEN ?? "";
const SERVER_NAME = process.env.DOC2MCP_SERVER_NAME ?? "doc2mcp";

const TOOLS = [
  {
    name: "list_documentation_pages",
    description: "List all crawled documentation pages with titles and URLs.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_documentation_page",
    description: "Get full text of one page by url or id from the list.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        id: { type: "string" },
      },
    },
  },
  {
    name: "search_documentation",
    description: "Search all documentation by keywords.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_documentation_overview",
    description: "Overview, page index, llms.txt, and summary.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "read_full_documentation",
    description: "All crawled pages as one markdown document.",
    inputSchema: {
      type: "object",
      properties: { maxPages: { type: "number" } },
    },
  },
  {
    name: "ask_documentation",
    description:
      "Ask a question answered from the docs using doc2mcp AI (platform key, not yours).",
    inputSchema: {
      type: "object",
      properties: {
        question: { type: "string" },
      },
      required: ["question"],
    },
  },
] as const;

function headers(): HeadersInit {
  return {
    "X-Doc2MCP-Token": PROJECT_TOKEN,
    "Content-Type": "application/json",
  };
}

async function mcpGet(path: string): Promise<unknown> {
  if (!PROJECT_ID || !PROJECT_TOKEN) {
    throw new Error(
      "Set DOC2MCP_PROJECT_ID and DOC2MCP_PROJECT_TOKEN from the doc2mcp convert page"
    );
  }
  const res = await fetch(`${BASE_URL}/api/mcp/${PROJECT_ID}${path}`, {
    headers: headers(),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `doc2mcp API ${res.status}`);
  }
  return res.json();
}

function textResult(data: unknown) {
  const text =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return { content: [{ type: "text" as const, text }] };
}

async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  switch (name) {
    case "list_documentation_pages": {
      const data = await mcpGet("/pages");
      return textResult(data);
    }
    case "get_documentation_page": {
      const ref = String(args.url ?? args.id ?? "");
      const data = await mcpGet(`/pages?ref=${encodeURIComponent(ref)}`);
      return textResult(data);
    }
    case "search_documentation": {
      const q = encodeURIComponent(String(args.query ?? ""));
      const data = await mcpGet(`/search?q=${q}`);
      return textResult(data);
    }
    case "get_documentation_overview": {
      const data = await mcpGet("/overview");
      return textResult(data);
    }
    case "read_full_documentation": {
      const max = args.maxPages ? `?maxPages=${args.maxPages}` : "";
      const data = await mcpGet(`/full${max}`);
      const payload = data as { markdown?: string };
      return textResult(payload.markdown ?? data);
    }
    case "ask_documentation": {
      const res = await fetch(`${BASE_URL}/api/mcp/${PROJECT_ID}/ask`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ question: String(args.question ?? "") }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `doc2mcp ask ${res.status}`);
      }
      return textResult(await res.json());
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

const server = new Server(
  { name: SERVER_NAME, version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [...TOOLS],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = (request.params.arguments ?? {}) as Record<string, unknown>;
  return handleTool(request.params.name, args);
});

const transport = new StdioServerTransport();
await server.connect(transport);
