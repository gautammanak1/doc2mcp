import type { ApiEndpoint, ApiGraphEdge, ApiGraphNode } from "@/types/platform";

export function buildApiGraph(
  endpoints: ApiEndpoint[],
  authPatterns: Array<{ type: string; description: string }>
): { nodes: ApiGraphNode[]; edges: ApiGraphEdge[] } {
  const nodes: ApiGraphNode[] = [];
  const edges: ApiGraphEdge[] = [];

  if (authPatterns.length > 0) {
    nodes.push({
      id: "auth-root",
      type: "auth",
      label: authPatterns.at(0)?.type ?? "Auth",
      data: { description: authPatterns.at(0)?.description },
      position: { x: 400, y: 50 },
    });
  }

  const resourceGroups = new Map<string, ApiEndpoint[]>();
  for (const endpoint of endpoints) {
    const resource = endpoint.path.split("/").filter(Boolean).at(0) ?? "api";
    const existing = resourceGroups.get(resource) ?? [];
    existing.push(endpoint);
    resourceGroups.set(resource, existing);
  }

  let resourceIndex = 0;
  for (const [resource, groupEndpoints] of resourceGroups) {
    const resourceNodeId = `resource-${resource}`;
    const xBase = 100 + (resourceIndex % 4) * 220;
    const yBase = 200 + Math.floor(resourceIndex / 4) * 180;

    nodes.push({
      id: resourceNodeId,
      type: "resource",
      label: resource,
      data: { endpointCount: groupEndpoints.length },
      position: { x: xBase, y: yBase },
    });

    if (authPatterns.length > 0) {
      edges.push({
        id: `auth-${resource}`,
        source: "auth-root",
        target: resourceNodeId,
        label: "authenticates",
        animated: true,
      });
    }

    for (const [i, endpoint] of groupEndpoints.entries()) {
      const nodeId = `endpoint-${endpoint.id}`;
      nodes.push({
        id: nodeId,
        type: "endpoint",
        label: `${endpoint.method} ${endpoint.path}`,
        data: {
          method: endpoint.method,
          path: endpoint.path,
          summary: endpoint.summary,
        },
        position: { x: xBase + (i % 2) * 100, y: yBase + 80 + Math.floor(i / 2) * 60 },
      });

      edges.push({
        id: `${resourceNodeId}-${nodeId}`,
        source: resourceNodeId,
        target: nodeId,
        label: endpoint.method,
      });
    }

    resourceIndex++;
  }

  return { nodes, edges };
}
