import { asi1GenerateText } from "@/lib/asi1/client";
import type { ApiEndpoint, CompressedTool } from "@/types/platform";

function groupEndpointsByResource(
  endpoints: ApiEndpoint[]
): Record<string, ApiEndpoint[]> {
  const groups: Record<string, ApiEndpoint[]> = {};

  for (const endpoint of endpoints) {
    const segments = endpoint.path.split("/").filter(Boolean);
    const resource = segments.at(0) ?? "default";
    if (!groups[resource]) {
      groups[resource] = [];
    }
    groups[resource].push(endpoint);
  }

  return groups;
}

export async function compressApiToTools(
  endpoints: ApiEndpoint[],
  projectName: string
): Promise<CompressedTool[]> {
  if (endpoints.length === 0) {
    return [
      {
        name: "search_documentation",
        description: `Search the ${projectName} documentation by keywords.`,
        parameters: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"],
        },
        endpoints: [],
      },
      {
        name: "read_documentation_page",
        description: `Read a specific ${projectName} documentation page (by url or id).`,
        parameters: {
          type: "object",
          properties: {
            url: { type: "string" },
            id: { type: "string" },
          },
        },
        endpoints: [],
      },
      {
        name: "ask_documentation",
        description: `Ask a natural-language question about ${projectName} docs.`,
        parameters: {
          type: "object",
          properties: { question: { type: "string" } },
          required: ["question"],
        },
        endpoints: [],
      },
    ];
  }

  const grouped = groupEndpointsByResource(endpoints);
  const endpointList = endpoints
    .map((e) => `${e.method} ${e.path}${e.summary ? ` - ${e.summary}` : ""}`)
    .join("\n");

  const { text } = await asi1GenerateText([
    {
      role: "system",
      content: `You compress REST APIs into human-friendly AI tools. Instead of raw HTTP endpoints, create semantic function names like create_customer(), list_orders(), authenticate_user().

Return ONLY valid JSON array:
[{"name": "create_customer", "description": "Create a new customer", "parameters": {"type":"object","properties":{...},"required":[]}, "endpoints": ["POST /customers"]}]`,
    },
    {
      role: "user",
      content: `Compress these ${projectName} API endpoints into 5-15 semantic AI tools:\n\n${endpointList}\n\nResource groups: ${Object.keys(grouped).join(", ")}`,
    },
  ]);

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(jsonMatch?.[0] ?? "[]") as CompressedTool[];
    if (parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fall through to heuristic compression
  }

  return heuristicCompress(endpoints);
}

function heuristicCompress(endpoints: ApiEndpoint[]): CompressedTool[] {
  const tools: CompressedTool[] = [];
  const seen = new Set<string>();

  for (const endpoint of endpoints) {
    const segments = endpoint.path.split("/").filter(Boolean);
    const resource = segments.at(-1) ?? "resource";
    const action = methodToAction(endpoint.method);
    const name = `${action}_${resource.replace(/[^a-zA-Z0-9]/g, "_")}`;

    if (seen.has(name)) {
      continue;
    }
    seen.add(name);

    tools.push({
      name,
      description: endpoint.summary ?? `${endpoint.method} ${endpoint.path}`,
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "Resource identifier" },
          data: { type: "object", description: "Request payload" },
        },
      },
      endpoints: [`${endpoint.method} ${endpoint.path}`],
    });
  }

  return tools.slice(0, 15);
}

function methodToAction(method: string): string {
  const map: Record<string, string> = {
    GET: "get",
    POST: "create",
    PUT: "update",
    PATCH: "update",
    DELETE: "delete",
  };
  return map[method.toUpperCase()] ?? "call";
}
