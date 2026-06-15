import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { asi1GenerateImage } from "@/lib/asi1/client";

const bodySchema = z.object({
  prompt: z.string().min(1).max(2000),
  size: z
    .enum(["", "256x256", "512x512", "1024x1024", "1024x1792", "1792x1024"])
    .optional(),
  n: z.number().int().min(1).max(4).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.type === "guest") {
    return Response.json(
      { error: "Sign in to generate images." },
      { status: 401 }
    );
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { images } = await asi1GenerateImage({
      prompt: parsed.prompt,
      size: parsed.size ?? "",
      n: parsed.n ?? 1,
    });

    if (images.length === 0) {
      return Response.json(
        { error: "The image model returned no image. Try a different prompt." },
        { status: 502 }
      );
    }

    return Response.json({ images });
  } catch (error) {
    console.error("Gemini image generation error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not generate image.",
      },
      { status: 500 }
    );
  }
}
