"use client";

import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import { APIGraph } from "@/components/visualization/api-graph";
import { WorkflowDiagram } from "@/components/visualization/workflow-diagram";
import { LiveProcessor } from "@/components/processing/live-processor";
import type { AuthMethod } from "@/lib/ai/auth-inference";
import type { DetectedWorkflow } from "@/lib/ai/workflow-detector";

export default function AnalysisPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [activeTab, setActiveTab] = useState<
    "processing" | "graph" | "workflows" | "auth"
  >("processing");
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>([]);
  const [workflows, setWorkflows] = useState<DetectedWorkflow[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleProcessingComplete = (result: unknown) => {
    setIsComplete(true);
    console.log("[v0] Processing complete:", result);
  };

  const handleProcessingError = (error: Error) => {
    console.error("[v0] Processing error:", error);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Project Analysis
          </h1>
          <p className="mt-2 text-gray-600">
            Real-time documentation processing and API graph generation
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {[
            { id: "processing", label: "Live Processing" },
            { id: "graph", label: "API Graph" },
            { id: "workflows", label: "Workflows" },
            { id: "auth", label: "Authentication" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as "processing" | "graph" | "workflows" | "auth"
                )
              }
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <Suspense fallback={<LoadingFallback />}>
          {activeTab === "processing" && (
            <div>
              <LiveProcessor
                projectId={projectId}
                onComplete={handleProcessingComplete}
                onError={handleProcessingError}
                autoStart={true}
              />
            </div>
          )}

          {activeTab === "graph" && isComplete && (
            <div>
              <APIGraph
                workflows={workflows}
                authMethods={authMethods}
                title="API Architecture Graph"
              />
            </div>
          )}

          {activeTab === "workflows" && workflows.length > 0 && (
            <div className="space-y-6">
              {workflows.map((workflow, idx) => (
                <WorkflowDiagram
                  key={idx}
                  workflow={workflow}
                  showDetails={true}
                />
              ))}
            </div>
          )}

          {activeTab === "auth" && authMethods.length > 0 && (
            <div className="space-y-4">
              {authMethods.map((method, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {method.type.toUpperCase()}
                      </h3>
                      <p className="mt-1 text-gray-600">
                        {method.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      {method.type}
                    </span>
                  </div>

                  {method.headerName && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">
                        Header Name:
                      </p>
                      <p className="mt-1 font-mono text-sm text-gray-600">
                        {method.headerName}
                      </p>
                    </div>
                  )}

                  {method.format && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">
                        Format:
                      </p>
                      <p className="mt-1 font-mono text-sm text-gray-600">
                        {method.format}
                      </p>
                    </div>
                  )}

                  {method.scopes && method.scopes.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">
                        Scopes:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {method.scopes.map((scope, idx) => (
                          <span
                            key={idx}
                            className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {method.endpoints && method.endpoints.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">
                        Endpoints:
                      </p>
                      <ul className="mt-2 space-y-1">
                        {method.endpoints.map((endpoint, idx) => (
                          <li
                            key={idx}
                            className="font-mono text-sm text-gray-600"
                          >
                            {endpoint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isComplete && activeTab !== "processing" && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
              <p className="text-yellow-900">
                Processing incomplete. Please check the{" "}
                <button
                  onClick={() => setActiveTab("processing")}
                  className="font-semibold underline hover:no-underline"
                >
                  Live Processing
                </button>{" "}
                tab.
              </p>
            </div>
          )}
        </Suspense>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <div className="space-y-4">
      <div className="h-20 animate-pulse rounded-lg bg-gray-200" />
      <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
    </div>
  );
}
