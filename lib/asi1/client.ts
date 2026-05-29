import "server-only";

const ASI1_BASE_URL = "https://api.asi1.ai/v1";
export const ASI1_MODEL = process.env.ASI1_MODEL ?? "asi1";
export const ASI1_IMAGE_MODEL = process.env.ASI1_IMAGE_MODEL ?? "asi1";

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
  const key = process.env.ASI_ONE_API_KEY;
  if (!key) {
    throw new Error("ASI_ONE_API_KEY is not configured");
  }
  return key;
}

export async function asi1ChatCompletion(
  request: Omit<Asi1ChatCompletionRequest, "model"> & { model?: string }
): Promise<Asi1ChatCompletionResponse> {
  const response = await fetch(`${ASI1_BASE_URL}/chat/completions`, {
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
    throw new Error(`ASI1 API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<Asi1ChatCompletionResponse>;
}

export async function asi1ChatCompletionStream(
  request: Omit<Asi1ChatCompletionRequest, "model"> & { model?: string }
): Promise<Response> {
  const response = await fetch(`${ASI1_BASE_URL}/chat/completions`, {
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
    throw new Error(`ASI1 API error (${response.status}): ${errorText}`);
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

/**
 * Generate an image with the ASI1 image API.
 *
 *   POST https://api.asi1.ai/v1/image/generate
 *   { model, prompt, size }
 *
 * Returns the parsed list of images, normalising the different shapes the
 * upstream API has been observed to return.
 */
export async function asi1GenerateImage(
  request: Asi1ImageGenerationRequest
): Promise<{ images: GeneratedImage[]; raw: Asi1ImageGenerationResponse }> {
  const response = await fetch(`${ASI1_BASE_URL}/image/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: request.model ?? ASI1_IMAGE_MODEL,
      prompt: request.prompt,
      size: request.size ?? "",
      ...(request.n ? { n: request.n } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ASI1 image API error (${response.status}): ${errorText}`);
  }

  const raw = (await response.json()) as Asi1ImageGenerationResponse;

  const fromData: GeneratedImage[] =
    raw.data?.map((d) => ({
      url: d.url,
      b64Json: d.b64_json,
      revisedPrompt: d.revised_prompt,
    })) ?? [];

  if (fromData.length === 0 && raw.image_url) {
    fromData.push({ url: raw.image_url });
  }

  return { images: fromData, raw };
}

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
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 4096,
      });

      const text = result.choices.at(0)?.message.content ?? "";
      return { text, usage: result.usage };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 500));
      }
    }
  }

  throw lastError ?? new Error("ASI1 request failed");
}
