import "server-only";

const ASI1_BASE_URL = "https://api.asi1.ai/v1";
export const ASI1_MODEL = process.env.ASI1_MODEL ?? "asi1-ultra";

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
