"use client";

import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LiveProcessor } from "@/components/processing/live-processor";
import { APIGraph } from "@/components/visualization/api-graph";
import { WorkflowDiagram } from "@/components/visualization/workflow-diagram";
import type { AuthMethod } from "@/lib/ai/auth-inference";
import type { DetectedWorkflow } from "@/lib/ai/workflow-detector";

export default function AnalysisPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnalysisPageContent />
    </Suspense>
  );
}

function AnalysisPageContent() {
  const params = useParams();
  const projectId = params.id as string;

  const [activeTab, setActiveTab] = useState<
    "processing" | "graph" | "workflows" | "auth"
  >("processing");
  const [authMethods, _setAuthMethods] = useState<AuthMethod[]>([]);
  const [workflows, _setWorkflows] = useState<DetectedWorkflow[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleProcessingComplete = (_result: unknown) => {
    setIsComplete(true);
  };

  const handleProcessingError = (error: Error) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[analysis] processing error:", error.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Analysis</h1>
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
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as "processing" | "graph" | "workflows" | "auth"
                )
              }
              type="button"
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
                autoStart={true}
                onComplete={handleProcessingComplete}
                onError={handleProcessingError}
                projectId={projectId}
              />
            </div>
          )}

          {activeTab === "graph" && isComplete && (
            <div>
              <APIGraph
                authMethods={authMethods}
                title="API Architecture Graph"
                workflows={workflows}
              />
            </div>
          )}

          {activeTab === "workflows" && workflows.length > 0 && (
            <div className="space-y-6">
              {workflows.map((workflow) => (
                <WorkflowDiagram
                  key={workflow.name}
                  showDetails={true}
                  workflow={workflow}
                />
              ))}
            </div>
          )}

          {activeTab === "auth" && authMethods.length > 0 && (
            <div className="space-y-4">
              {authMethods.map((method) => (
                <div
                  className="rounded-lg border border-gray-200 bg-white p-6"
                  key={`${method.type}-${method.description}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {method.type.toUpperCase()}
                      </h3>
                      <p className="mt-1 text-gray-600">{method.description}</p>
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
                        {method.scopes.map((scope) => (
                          <span
                            className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                            key={scope}
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
                        {method.endpoints.map((endpoint) => (
                          <li
                            className="font-mono text-sm text-gray-600"
                            key={endpoint}
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
                  className="font-semibold underline hover:no-underline"
                  onClick={() => setActiveTab("processing")}
                  type="button"
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
