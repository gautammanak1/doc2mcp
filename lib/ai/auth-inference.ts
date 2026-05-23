import Anthropic from "@anthropic-ai/sdk";

export interface AuthMethod {
  type:
    | "api_key"
    | "oauth2"
    | "bearer"
    | "basic"
    | "jwt"
    | "custom"
    | "none";
  description: string;
  headerName?: string;
  format?: string;
  scopes?: string[];
  endpoints?: string[];
}

export interface AuthInference {
  methods: AuthMethod[];
  confidence: number;
  summary: string;
  securityConsiderations: string[];
}

const client = new Anthropic();

export async function inferAuthMethods(
  documentationContent: string,
  projectName: string
): Promise<AuthInference> {
  const prompt = `Analyze the following documentation and identify all authentication methods used. 
  
Documentation:
${documentationContent.slice(0, 5000)}

Project: ${projectName}

Return a JSON object with:
{
  "methods": [
    {
      "type": "api_key|oauth2|bearer|basic|jwt|custom|none",
      "description": "How to use this auth method",
      "headerName": "header name if applicable",
      "format": "format of the key/token",
      "scopes": ["list of scopes if OAuth"],
      "endpoints": ["which endpoints use this auth"]
    }
  ],
  "confidence": 0.0-1.0,
  "summary": "Brief summary of auth requirements",
  "securityConsiderations": ["list of security notes"]
}`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        methods: parsed.methods || [],
        confidence: parsed.confidence || 0,
        summary: parsed.summary || "",
        securityConsiderations: parsed.securityConsiderations || [],
      };
    }
  } catch (error) {
    console.error("[v0] Failed to parse auth inference:", error);
  }

  return {
    methods: [],
    confidence: 0,
    summary: "Unable to determine authentication methods",
    securityConsiderations: [],
  };
}

export async function generateAuthImplementation(
  authMethods: AuthMethod[],
  framework: string = "typescript"
): Promise<string> {
  const methodsDesc = authMethods
    .map((m) => `- ${m.type}: ${m.description}`)
    .join("\n");

  const prompt = `Generate ${framework} code for implementing the following authentication methods:
${methodsDesc}

Include:
1. Client initialization
2. Header/token setup
3. Error handling
4. Token refresh logic if applicable

Return production-ready code with comments.`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
