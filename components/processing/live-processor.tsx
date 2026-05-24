"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useSSE } from "@/lib/hooks/use-sse";

export interface LogEntry {
  timestamp: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
  progress?: number;
  details?: string;
}

export interface ProcessingMetrics {
  totalSteps: number;
  completedSteps: number;
  currentStep: string;
  timeElapsed: number;
  estimatedTimeRemaining: number;
  tokensProcessed: number;
  itemsProcessed: number;
}

interface LiveProcessorProps {
  projectId: string;
  onComplete?: (result: unknown) => void;
  onError?: (error: Error) => void;
  autoStart?: boolean;
}

export function LiveProcessor({
  projectId,
  onComplete,
  onError,
  autoStart = true,
}: LiveProcessorProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<ProcessingMetrics>({
    totalSteps: 0,
    completedSteps: 0,
    currentStep: "Initializing...",
    timeElapsed: 0,
    estimatedTimeRemaining: 0,
    tokensProcessed: 0,
    itemsProcessed: 0,
  });
  const [isProcessing, setIsProcessing] = useState(autoStart);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const { data, error, isLoading } = useSSE(
    `/api/process/${projectId}`,
    autoStart
  );

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Process incoming SSE data
  useEffect(() => {
    if (data) {
      try {
        const parsed = JSON.parse(data);

        if (parsed.type === "log") {
          setLogs((prev) => [...prev, parsed.log as LogEntry]);
        } else if (parsed.type === "metrics") {
          setMetrics(parsed.metrics as ProcessingMetrics);
        } else if (parsed.type === "complete") {
          setIsProcessing(false);
          onComplete?.(parsed.result);
        } else if (parsed.type === "error") {
          setIsProcessing(false);
          const err = new Error(parsed.error);
          onError?.(err);
        }
      } catch (e) {
        console.error("[v0] Failed to parse SSE data:", e);
      }
    }
  }, [data, onComplete, onError]);

  useEffect(() => {
    if (error) {
      setIsProcessing(false);
      onError?.(error);
    }
  }, [error, onError]);

  const getLogColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getLogIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      default:
        return "•";
    }
  };

  const progressPercentage = Math.round(
    (metrics.completedSteps / metrics.totalSteps) * 100
  );

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6">
      {/* Metrics Header */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Step" value={metrics.currentStep} />
        <MetricCard
          label="Progress"
          value={`${metrics.completedSteps}/${metrics.totalSteps}`}
        />
        <MetricCard
          label="Time Elapsed"
          value={`${Math.floor(metrics.timeElapsed / 1000)}s`}
        />
        <MetricCard
          label="Tokens"
          value={metrics.tokensProcessed.toLocaleString()}
        />
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm text-gray-500">{progressPercentage}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Logs Container */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-900">Processing Logs</h3>
        <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="space-y-2 font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">
                {isLoading ? "Initializing..." : "No logs yet"}
              </p>
            ) : (
              logs.map((log) => (
                <LogLine
                  colorClass={getLogColor(log.level)}
                  key={`${log.timestamp}-${log.message}`}
                  log={log}
                >
                  {getLogIcon(log.level)}
                </LogLine>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isProcessing ? "bg-blue-600" : "bg-green-600"
            }`}
          />
          <span className="text-sm text-gray-600">
            {isProcessing ? "Processing..." : "Complete"}
          </span>
        </div>
        {metrics.estimatedTimeRemaining > 0 && (
          <span className="text-sm text-gray-500">
            ~{Math.floor(metrics.estimatedTimeRemaining / 1000)}s remaining
          </span>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function LogLine({
  log,
  colorClass,
  children,
}: {
  log: LogEntry;
  colorClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className={`flex-shrink-0 font-bold ${colorClass}`}>
        {children}
      </span>
      <div className="flex-1">
        <span className={colorClass}>[{log.timestamp}]</span>
        <span className="ml-2 text-gray-900">{log.message}</span>
        {log.details && (
          <div className="mt-1 ml-0 text-gray-600 text-xs">{log.details}</div>
        )}
        {log.progress !== undefined && (
          <div className="mt-1 h-1 w-full rounded-full bg-gray-300">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${log.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
