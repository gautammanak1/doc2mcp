import { after } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { isAdminEmail } from "@/lib/admin/admin-access";
import {
  assertCanStartConversion,
  EntitlementError,
} from "@/lib/billing/entitlements";
import { getPlatformProjectById } from "@/lib/db/queries";
import { detectSourceTypeFromUrl } from "@/lib/doc2mcp/detect-source-type";
import { ChatbotError } from "@/lib/errors";
import { enqueuePipelineJob, isQstashConfigured } from "@/lib/queue/qstash";
import { processProjectPipeline } from "@/services/pipeline/process-project";

function shouldBypassLimits(email: string | null | undefined): boolean {
  if (process.env.DOC2MCP_BYPASS_LIMITS === "1") {
    return true;
  }
  return isAdminEmail(email);
}

/**
 * POST /api/projects/:id/sync
 *
 * Re-runs the ingestion pipeline for an existing project. Used by the
 * "Auto-sync MCP when docs change" feature: a Vercel cron (or webhook from
 * docs platforms) hits this endpoint, and the pipeline re-crawls + compares
 * against the previous content hash before regenerating the MCP toolkit.
 *
 * For now this endpoint trusts the pipeline to be idempotent (it overwrites
 * `artifacts`, `crawlData`, etc.) and simply schedules a re-run after the
 * response.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatbotError("unauthorized:api").toResponse();
  }
  if (session.user.type === "guest") {
    return Response.json(
      {
        error: "auth_required",
        message: "Sign in to sync your MCP server.",
      },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const project = await getPlatformProjectById({
      id,
      userId: session.user.id,
    });
    if (!project) {
      return Response.json(
        { error: "not_found", message: "Project not found." },
        { status: 404 }
      );
    }
    if (!project.sourceUrl) {
      return Response.json(
        {
          error: "no_source_url",
          message:
            "This project has no source URL, so it can't be auto-synced. Re-create it from a docs URL to enable sync.",
        },
        { status: 400 }
      );
    }

    if (!shouldBypassLimits(session.user.email)) {
      await assertCanStartConversion(session.user.id);
    }

    const sourceType =
      project.sourceType ?? detectSourceTypeFromUrl(project.sourceUrl);

    const jobPayload = {
      projectId: project.id,
      userId: session.user.id,
      sourceUrl: project.sourceUrl,
      sourceType,
      projectName: project.name,
    };

    if (isQstashConfigured()) {
      try {
        await enqueuePipelineJob(jobPayload);
      } catch (error) {
        console.error("QStash enqueue failed, falling back to after():", error);
        after(() => processProjectPipeline(jobPayload));
      }
    } else {
      after(() => processProjectPipeline(jobPayload));
    }

    return Response.json({
      id: project.id,
      status: "syncing",
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof EntitlementError) {
      return Response.json(
        { error: "entitlement", message: error.message },
        { status: 403 }
      );
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("Sync API error:", error);
    }
    return new ChatbotError("bad_request:api").toResponse();
  }
}
