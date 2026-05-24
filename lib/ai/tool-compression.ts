import Anthropic from "@anthropic-ai/sdk";

export interface ToolSignature {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  returns: string;
  examples: string[];
}

export interface CompressedTool {
  original: ToolSignature;
  compressed: ToolSignature;
  optimizations: string[];
  tokensReduced: number;
  compressionRatio: number;
}

export interface CompressionResult {
  tools: CompressedTool[];
  totalTokensOriginal: number;
  totalTokensCompressed: number;
  overallReduction: number;
  recommendations: string[];
}

const client = new Anthropic();

// Estimate tokens (rough approximation)
function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length / 0.75);
}

export async function compressTools(
  tools: ToolSignature[]
): Promise<CompressionResult> {
  const toolsJson = JSON.stringify(tools, null, 2);

  const prompt = `You are an expert at optimizing tool definitions for AI/LLM use.

Analyze these tool definitions and provide a compressed version that:
1. Removes redundant descriptions
2. Simplifies parameter names where possible
3. Consolidates related tools
4. Removes unnecessary examples
5. Uses abbreviated but clear descriptions

Original tools:
${toolsJson}

For each tool, return a compressed version with explanations of optimizations.
Return as JSON:
{
  "compressedTools": [
    {
      "originalName": "original_name",
      "compressedName": "compressed_name (or same)",
      "originalDescription": "...",
      "compressedDescription": "...", 
      "optimizations": ["removed X", "simplified Y"],
      "tokensReduced": number
    }
  ],
  "recommendations": ["consolidate X and Y", "batch operation Z"]
}`;

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

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const totalTokensOriginal = estimateTokens(toolsJson);

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const compressedTools: CompressedTool[] = (
        parsed.compressedTools || []
      ).map(
        (ct: {
          originalName: string;
          originalDescription: string;
          compressedDescription: string;
          tokensReduced: number;
          optimizations: string[];
        }) => {
          const original = tools.find((t) => t.name === ct.originalName);
          if (!original) {
            return null;
          }

          const compressed: ToolSignature = {
            ...original,
            description: ct.compressedDescription,
          };

          return {
            original,
            compressed,
            optimizations: ct.optimizations || [],
            tokensReduced: ct.tokensReduced || 0,
            compressionRatio:
              (ct.tokensReduced || 0) /
              estimateTokens(JSON.stringify(original)),
          };
        }
      );

      const validTools = compressedTools.filter(
        (t): t is CompressedTool => t !== null
      );
      const totalTokensCompressed = validTools.reduce(
        (sum, t) => sum + (estimateTokens(JSON.stringify(t.compressed)) || 0),
        0
      );

      return {
        tools: validTools,
        totalTokensOriginal,
        totalTokensCompressed,
        overallReduction:
          ((totalTokensOriginal - totalTokensCompressed) /
            totalTokensOriginal) *
          100,
        recommendations: parsed.recommendations || [],
      };
    }
  } catch (error) {
    console.error("[v0] Failed to parse compression result:", error);
  }

  return {
    tools: [],
    totalTokensOriginal,
    totalTokensCompressed: totalTokensOriginal,
    overallReduction: 0,
    recommendations: [],
  };
}

export function compressToolDescription(tool: ToolSignature): {
  compressed: ToolSignature;
  reduction: string;
} {
  const original = JSON.stringify(tool);
  const originalLength = original.length;

  // Simple compression rules
  const compressed = {
    ...tool,
    description: tool.description
      .replace(/The /g, "")
      .replace(/This /g, "")
      .replace(/ method/g, "")
      .replace(/ function/g, "")
      .slice(0, 100),
  };

  const compressedJson = JSON.stringify(compressed);
  const compressedLength = compressedJson.length;
  const reduction =
    (((originalLength - compressedLength) / originalLength) * 100).toFixed(1) +
    "%";

  return { compressed, reduction };
}

export async function suggestToolConsolidation(
  tools: ToolSignature[]
): Promise<{
  consolidations: Array<{
    tools: string[];
    reason: string;
    newTool: Partial<ToolSignature>;
  }>;
  standalone: string[];
}> {
  const toolsList = tools.map((t) => `${t.name}: ${t.description}`).join("\n");

  const prompt = `Analyze these tools and suggest consolidations:

${toolsList}

Which tools could be merged? Which should remain standalone?
Return JSON:
{
  "consolidations": [
    {
      "tools": ["tool1", "tool2"],
      "reason": "why merge",
      "newTool": {
        "name": "consolidated_name",
        "description": "new description"
      }
    }
  ],
  "standalone": ["tool_names"]
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
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("[v0] Failed to parse consolidation suggestions:", error);
  }

  return {
    consolidations: [],
    standalone: tools.map((t) => t.name),
  };
}
