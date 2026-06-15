import "server-only";

/**
 * AI client. Backed by Google Gemini.
 *
 * Text/chat uses Gemini's OpenAI-compatible endpoint so the request/response
 * (and SSE streaming) shapes stay identical to the previous provider; image
 * generation uses the native `generateContent` endpoint (gemini image model
 * returns base64 PNG via inlineData).
 *
 * Function names keep their historical `asi1*` prefix so existing callers do
 * not need to change; the implementation underneath is Gemini.
 */

const GEMINI_OPENAI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai";
const GEMINI_NATIVE_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta";

export const ASI1_MODEL =
  process.env.GEMINI_MODEL ?? process.env.ASI1_MODEL ?? "gemini-2.5-flash";
export const ASI1_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL ??
  process.env.ASI1_IMAGE_MODEL ??
  "gemini-2.5-flash-image";

export type Asi1Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type Asi1ChatCompletionRequest = {
  model: string;
  messages: Asi1Message[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
};

export type Asi1ChatCompletionResponse = {
  id: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY ?? process.env.ASI_ONE_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return key;
}

export async function asi1ChatCompletion(
  request: Omit<Asi1ChatCompletionRequest, "model"> & { model?: string }
): Promise<Asi1ChatCompletionResponse> {
  const response = await fetch(`${GEMINI_OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: ASI1_MODEL,
      ...request,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<Asi1ChatCompletionResponse>;
}

export async function asi1ChatCompletionStream(
  request: Omit<Asi1ChatCompletionRequest, "model"> & { model?: string }
): Promise<Response> {
  const response = await fetch(`${GEMINI_OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: ASI1_MODEL,
      stream: true,
      ...request,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  return response;
}

export type Asi1ImageSize =
  | ""
  | "256x256"
  | "512x512"
  | "1024x1024"
  | "1024x1792"
  | "1792x1024";

export type Asi1ImageGenerationRequest = {
  prompt: string;
  size?: Asi1ImageSize;
  model?: string;
  n?: number;
};

export type Asi1ImageGenerationResponse = {
  created?: number;
  data?: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
  /** Some providers return a single shorthand `image_url`. */
  image_url?: string;
};

export type GeneratedImage = {
  url?: string;
  b64Json?: string;
  revisedPrompt?: string;
};

type GeminiInlineData = { mimeType?: string; data?: string };
type GeminiPart = {
  text?: string;
  inlineData?: GeminiInlineData;
  inline_data?: GeminiInlineData;
};
type GeminiGenerateContentResponse = {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  error?: { message?: string };
};

/**
 * Generate an image with the Gemini image model.
 *
 *   POST {base}/models/{imageModel}:generateContent
 *
 * The model returns the image as base64 PNG inside `inlineData`. We normalise
 * it to the historical `GeneratedImage` shape (`b64Json`) so existing callers
 * and the UI keep working unchanged. `size` is folded into the prompt because
 * the native API does not take a discrete size enum.
 */
export async function asi1GenerateImage(
  request: Asi1ImageGenerationRequest
): Promise<{ images: GeneratedImage[]; raw: Asi1ImageGenerationResponse }> {
  const model = request.model ?? ASI1_IMAGE_MODEL;
  const sizeHint =
    request.size && request.size.length > 0
      ? ` Render at roughly ${request.size} resolution.`
      : "";

  const response = await fetch(
    `${GEMINI_NATIVE_BASE_URL}/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": getApiKey(),
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${request.prompt}${sizeHint}` }] }],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gemini image API error (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as GeminiGenerateContentResponse;
  const parts = data.candidates?.at(0)?.content?.parts ?? [];

  const images: GeneratedImage[] = [];
  let revisedPrompt: string | undefined;
  for (const part of parts) {
    if (part.text) {
      revisedPrompt = part.text;
    }
    const inline = part.inlineData ?? part.inline_data;
    if (inline?.data) {
      images.push({ b64Json: inline.data, revisedPrompt });
    }
  }

  const raw: Asi1ImageGenerationResponse = {
    data: images.map((img) => ({
      b64_json: img.b64Json,
      revised_prompt: img.revisedPrompt,
    })),
  };

  return { images, raw };
}

/**
 * Generate text via Gemini chat completions.
 *
 * Defaults tuned for doc2mcp's actual workload (structured extraction,
 * documentation Q&A, deterministic API simulation):
 *   - temperature: 0.1 — doc2mcp parses JSON out of nearly every response;
 *     high temperature wastes tokens on creative phrasing and produces
 *     unparseable output ~5-10% of the time.
 *   - max_tokens: 2048 — the longest legitimate response in this codebase is
 *     the analyze step's endpoint list, which empirically fits in ~1500
 *     tokens. Lowering the cap halves the worst-case wait.
 *
 * Retries use exponential backoff WITH jitter to avoid thundering-herd during
 * regional outages.
 */
export async function asi1GenerateText(
  messages: Asi1Message[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<{ text: string; usage?: Asi1ChatCompletionResponse["usage"] }> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await asi1ChatCompletion({
        messages,
        temperature: options?.temperature ?? 0.1,
        max_tokens: options?.max_tokens ?? 2048,
      });

      const text = result.choices.at(0)?.message.content ?? "";
      return { text, usage: result.usage };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        const base = 2 ** attempt * 500;
        const jitter = Math.random() * 250;
        await new Promise((resolve) => setTimeout(resolve, base + jitter));
      }
    }
  }

  throw lastError ?? new Error("Gemini request failed");
}
