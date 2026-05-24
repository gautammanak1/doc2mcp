import Anthropic from "@anthropic-ai/sdk";

export interface WorkflowStep {
  name: string;
  description: string;
  inputParameters: string[];
  outputParameters: string[];
  errorHandling: string;
  alternatives?: string[];
}

export interface DetectedWorkflow {
  name: string;
  description: string;
  useCase: string;
  steps: WorkflowStep[];
  integrationPoints: string[];
  complexity: "simple" | "moderate" | "complex";
  estimatedTime: string;
}

export interface WorkflowDetectionResult {
  workflows: DetectedWorkflow[];
  commonPatterns: string[];
  recommendations: string[];
}

const client = new Anthropic();

export async function detectWorkflows(
  documentationContent: string,
  projectName: string
): Promise<WorkflowDetectionResult> {
  const prompt = `Analyze the documentation and extract typical workflows/use cases.

Documentation (first 5000 chars):
${documentationContent.slice(0, 5000)}

Project: ${projectName}

For each workflow, provide:
{
  "workflows": [
    {
      "name": "workflow name",
      "description": "what it does",
      "useCase": "when to use it",
      "steps": [
        {
          "name": "step name",
          "description": "what happens",
          "inputParameters": ["param1", "param2"],
          "outputParameters": ["output1", "output2"],
          "errorHandling": "how errors are handled",
          "alternatives": ["alternative approaches"]
        }
      ],
      "integrationPoints": ["external apis"],
      "complexity": "simple|moderate|complex",
      "estimatedTime": "estimated execution time"
    }
  ],
  "commonPatterns": ["list of common patterns"],
  "recommendations": ["optimization recommendations"]
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

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        workflows: parsed.workflows || [],
        commonPatterns: parsed.commonPatterns || [],
        recommendations: parsed.recommendations || [],
      };
    }
  } catch (error) {
    console.error("[v0] Failed to parse workflows:", error);
  }

  return {
    workflows: [],
    commonPatterns: [],
    recommendations: [],
  };
}

export async function generateWorkflowCode(
  workflow: DetectedWorkflow,
  language = "typescript"
): Promise<string> {
  const stepsDesc = workflow.steps
    .map((s) => `${s.name}: ${s.description}`)
    .join("\n");

  const prompt = `Generate ${language} code implementing this workflow:
Name: ${workflow.name}
Description: ${workflow.description}
Steps:
${stepsDesc}

Include:
1. Class/function structure
2. Error handling
3. Input/output validation
4. Logging
5. Type definitions

Return production-ready code.`;

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

export function workflowToMermaid(workflow: DetectedWorkflow): string {
  let mermaid = "graph TD\n";
  let nodeId = 0;

  mermaid += `  Start[${workflow.name}]\n`;
  nodeId++;

  for (const step of workflow.steps) {
    mermaid += `  Node${nodeId}["${step.name}"]\n`;
    mermaid += `  Start --> Node${nodeId}\n`;
    nodeId++;
  }

  mermaid += `  Node${nodeId}[End]\n`;
  mermaid += `  Node${nodeId - 1} --> Node${nodeId}\n`;

  return mermaid;
}
