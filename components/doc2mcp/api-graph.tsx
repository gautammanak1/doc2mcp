"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ApiGraphEdge, ApiGraphNode } from "@/types/platform";

const nodeColors: Record<string, string> = {
  endpoint: "#8b5cf6",
  resource: "#06b6d4",
  auth: "#f59e0b",
  workflow: "#10b981",
};

export function ApiGraph({
  nodes: initialNodes,
  edges: initialEdges,
}: {
  nodes: ApiGraphNode[];
  edges: ApiGraphEdge[];
}) {
  const flowNodes: Node[] = initialNodes.map((n) => ({
    id: n.id,
    type: "default",
    position: n.position,
    data: {
      label: (
        <div className="px-2 py-1 text-center">
          <p className="font-mono text-[10px] text-white/90">{n.label}</p>
        </div>
      ),
    },
    style: {
      background: nodeColors[n.type] ?? "#6366f1",
      color: "white",
      border: `1px solid ${nodeColors[n.type] ?? "#6366f1"}80`,
      borderRadius: 8,
      fontSize: 11,
      boxShadow: `0 0 24px ${nodeColors[n.type] ?? "#6366f1"}50`,
      minWidth: 100,
    },
  }));

  const flowEdges: Edge[] = initialEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: e.animated ?? true,
    style: { stroke: "#a78bfa80", strokeWidth: 2 },
  }));

  const [nodes, , onNodesChange] = useNodesState(flowNodes);
  const [edges, , onEdgesChange] = useEdgesState(flowEdges);

  return (
    <div className="h-full w-full bg-black/30">
      <ReactFlow
        edges={edges}
        fitView
        nodes={nodes}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
      >
        <Background
          color="#ffffff06"
          gap={24}
          variant={BackgroundVariant.Dots}
        />
        <Controls className="!bg-card/90 !border-white/10" />
        <MiniMap
          className="!bg-black/60"
          maskColor="rgb(0 0 0 / 0.7)"
          nodeColor={(n) => {
            const type = initialNodes.find((x) => x.id === n.id)?.type;
            return nodeColors[type ?? "endpoint"] ?? "#6366f1";
          }}
        />
      </ReactFlow>
    </div>
  );
}
