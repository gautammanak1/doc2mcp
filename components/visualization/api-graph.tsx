"use client";

import { useMemo } from "react";
import type { AuthMethod } from "@/lib/ai/auth-inference";
import type { DetectedWorkflow } from "@/lib/ai/workflow-detector";

export interface APINode {
  id: string;
  label: string;
  type: "endpoint" | "auth" | "data" | "workflow";
  color: string;
}

export interface APIEdge {
  from: string;
  to: string;
  label: string;
  weight: number;
}

interface APIGraphProps {
  workflows: DetectedWorkflow[];
  authMethods: AuthMethod[];
  title?: string;
}

export function APIGraph({
  workflows,
  authMethods,
  title = "API Architecture",
}: APIGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, APINode>();
    const edgeList: APIEdge[] = [];

    // Add auth nodes
    authMethods.forEach((auth, idx) => {
      const id = `auth-${idx}`;
      nodeMap.set(id, {
        id,
        label: auth.type.toUpperCase(),
        type: "auth",
        color: "#3b82f6",
      });
    });

    // Add workflow nodes and edges
    workflows.forEach((workflow, wIdx) => {
      const workflowId = `workflow-${wIdx}`;
      nodeMap.set(workflowId, {
        id: workflowId,
        label: workflow.name,
        type: "workflow",
        color: "#10b981",
      });

      // Add step nodes
      workflow.steps.forEach((step, stepIdx) => {
        const stepId = `${workflowId}-step-${stepIdx}`;
        nodeMap.set(stepId, {
          id: stepId,
          label: step.name,
          type: "endpoint",
          color: "#8b5cf6",
        });

        // Connect steps
        if (stepIdx > 0) {
          const prevStepId = `${workflowId}-step-${stepIdx - 1}`;
          edgeList.push({
            from: prevStepId,
            to: stepId,
            label: "sequence",
            weight: 1,
          });
        }
      });
    });

    return { nodes: Array.from(nodeMap.values()), edges: edgeList };
  }, [workflows, authMethods]);

  // Simple SVG rendering of graph
  const canvasWidth = 800;
  const canvasHeight = 600;

  // Simple layout algorithm - arrange nodes in a grid
  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    let col = 0;
    const _row = 0;
    const cols = Math.ceil(Math.sqrt(nodes.length));

    for (const node of nodes) {
      const x = (col % cols) * (canvasWidth / cols) + 50;
      const y =
        Math.floor(col / cols) *
          (canvasHeight / Math.ceil(nodes.length / cols)) +
        50;
      map.set(node.id, { x, y });
      col++;
    }

    return map;
  }, [nodes]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">Auth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-gray-600">Workflow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="text-gray-600">Endpoint</span>
          </div>
        </div>
      </div>

      <svg
        className="rounded-lg border border-gray-200 bg-white"
        height={canvasHeight}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        width="100%"
      >
        {/* Draw edges */}
        {edges.map((edge) => {
          const fromPos = positions.get(edge.from);
          const toPos = positions.get(edge.to);
          if (!fromPos || !toPos) {
            return null;
          }

          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                markerEnd="url(#arrowhead)"
                stroke="#d1d5db"
                strokeWidth="2"
                x1={fromPos.x}
                x2={toPos.x}
                y1={fromPos.y}
                y2={toPos.y}
              />
              <text
                fill="#6b7280"
                fontSize="12"
                textAnchor="middle"
                x={(fromPos.x + toPos.x) / 2}
                y={(fromPos.y + toPos.y) / 2 - 5}
              >
                {edge.label}
              </text>
            </g>
          );
        })}

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerHeight="10"
            markerWidth="10"
            orient="auto"
            refX="9"
            refY="3"
          >
            <polygon fill="#d1d5db" points="0 0, 10 3, 0 6" />
          </marker>
        </defs>

        {/* Draw nodes */}
        {nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) {
            return null;
          }

          return (
            <g key={node.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                fill={node.color}
                r="30"
                stroke="white"
                strokeWidth="2"
              />
              <text
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                x={pos.x}
                y={pos.y}
              >
                {node.label.slice(0, 8)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h4 className="mb-3 font-semibold text-gray-900">Components</h4>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Auth Methods" value={authMethods.length} />
          <StatCard label="Workflows" value={workflows.length} />
          <StatCard
            label="Total Endpoints"
            value={workflows.reduce((sum, w) => sum + w.steps.length, 0)}
          />
          <StatCard label="Connections" value={edges.length} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
