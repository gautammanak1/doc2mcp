import { after } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { createPlatformProject } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";
import { processProjectPipeline } from "@/services/pipeline/process-project";
import { detectSourceTypeFromUrl } from "@/lib/doc2mcp/detect-source-type";
import { deriveMcpServerSlug } from "@/lib/doc2mcp/naming";
import { z } from "zod";

const bodySchema = z.object({
  sourceUrl: z.string().url(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatbotError("unauthorized:api").toResponse();
  }

  if (session.user.type === "guest") {
    return Response.json(
      {
        error: "auth_required",
        message: "Sign in or create an account to generate an MCP server.",
      },
      { status: 401 }
    );
  }

  try {
    const { sourceUrl } = bodySchema.parse(await request.json());
    const sourceType = detectSourceTypeFromUrl(sourceUrl);
    const name = deriveMcpServerSlug(sourceUrl);

    const project = await createPlatformProject({
      userId: session.user.id,
      name,
      sourceUrl,
      sourceType,
    });

    after(async () => {
      await processProjectPipeline({
        projectId: project.id,
        userId: session.user.id,
        sourceUrl,
        sourceType,
        projectName: name,
      });
    });

    return Response.json({ id: project.id });
  } catch {
    return new ChatbotError("bad_request:api").toResponse();
  }
}
