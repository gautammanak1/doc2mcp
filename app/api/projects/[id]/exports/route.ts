import { auth } from "@/app/(auth)/auth";
import { getPlatformProjectById } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";
import { generateMcpExportBundle } from "@/services/mcp/exports";
import type { ProjectArtifacts } from "@/types/platform";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatbotError("unauthorized:api").toResponse();
  }

  const { id } = await params;
  const project = await getPlatformProjectById({
    id,
    userId: session.user.id,
  });

  if (!project) {
    return new ChatbotError("not_found:document").toResponse();
  }

  const artifacts = project.artifacts as ProjectArtifacts | null;
  if (!artifacts?.mcpConfig) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const bundle = generateMcpExportBundle({
    config: artifacts.mcpConfig,
    generationReport: artifacts.generationReport,
    redact: true,
  });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  if (format) {
    const artifact = bundle.artifacts.find((item) => item.id === format);
    if (!artifact) {
      return new ChatbotError("bad_request:api").toResponse();
    }

    return new Response(artifact.content, {
      headers: {
        "content-disposition": `attachment; filename="${artifact.filename}"`,
        "content-type": `${artifact.mimeType}; charset=utf-8`,
      },
    });
  }

  return Response.json({ bundle });
}
