import { cancel, intro, isCancel, outro, select, text } from "@clack/prompts";
import ora from "ora";
import pc from "picocolors";
import { ApiError, apiFetch, printError } from "../api.js";
import { ensureLoggedIn } from "./login.js";

type ProjectSummary = {
  id: string;
  name: string;
  sourceUrl: string | null;
  status: string;
  source: string;
};

type ProjectDetail = {
  project: { id: string; name: string; status: string };
  mcp: { url: string; token: string; serverName: string } | null;
};

type AskAnswer = {
  question: string;
  answer: string;
  sources?: Array<{ title: string; url: string }>;
};

type McpToolResult = {
  result?: {
    content?: Array<{ type: string; text?: string }>;
  };
  error?: { message?: string };
};

async function pickProject(explicitId?: string): Promise<ProjectDetail | null> {
  if (explicitId) {
    return await apiFetch<ProjectDetail>(`/api/cli/projects/${explicitId}`);
  }

  const data = await apiFetch<{ projects: ProjectSummary[] }>(
    "/api/cli/projects"
  );
  const ready = data.projects.filter((p) => p.status === "ready");

  if (ready.length === 0) {
    process.stdout.write(
      `${pc.yellow("No ready MCP projects yet.")} Create one: ${pc.bold("doc2mcp <docs-url>")}\n`
    );
    return null;
  }

  const choice = await select({
    message: "Which docs do you want to chat with?",
    options: ready.map((p) => ({
      value: p.id,
      label: p.name,
      hint: p.sourceUrl ?? undefined,
    })),
  });

  if (isCancel(choice)) {
    cancel("Cancelled.");
    return null;
  }

  return await apiFetch<ProjectDetail>(`/api/cli/projects/${choice}`);
}

async function askDocs(
  mcp: { url: string; token: string },
  question: string
): Promise<AskAnswer> {
  const response = await fetch(mcp.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mcp.token}`,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "ask_documentation", arguments: { question } },
    }),
  });

  const payload = (await response.json()) as McpToolResult;
  if (!response.ok || payload.error) {
    throw new ApiError(
      payload.error?.message ?? `MCP request failed (${response.status})`,
      response.status,
      payload
    );
  }

  const raw = payload.result?.content?.[0]?.text ?? "";
  try {
    return JSON.parse(raw) as AskAnswer;
  } catch {
    return { question, answer: raw };
  }
}

function renderAnswer(answer: AskAnswer): void {
  process.stdout.write(`\n${pc.cyan("◆")} ${answer.answer.trim()}\n`);
  if (answer.sources && answer.sources.length > 0) {
    process.stdout.write(`\n${pc.dim("Sources:")}\n`);
    for (const source of answer.sources.slice(0, 6)) {
      process.stdout.write(`  ${pc.dim("•")} ${source.title} ${pc.dim(source.url)}\n`);
    }
  }
  process.stdout.write("\n");
}

async function answerOnce(
  mcp: { url: string; token: string },
  question: string
): Promise<void> {
  const spinner = ora("Thinking…").start();
  try {
    const answer = await askDocs(mcp, question);
    spinner.stop();
    renderAnswer(answer);
  } catch (error) {
    spinner.fail("Failed to get an answer");
    printError(error);
  }
}

export async function runChat(
  projectId?: string,
  options: { message?: string } = {}
): Promise<void> {
  try {
    await ensureLoggedIn();

    const detail = await pickProject(projectId);
    if (!detail) {
      return;
    }

    if (!detail.mcp) {
      process.stderr.write(
        `${pc.red("That project is not ready yet.")} Check: ${pc.bold("doc2mcp list")}\n`
      );
      process.exitCode = 1;
      return;
    }

    const { mcp } = detail;

    if (options.message) {
      await answerOnce(mcp, options.message);
      return;
    }

    intro(
      `${pc.bold(`Chatting with ${detail.project.name}`)} ${pc.dim("— ask anything about these docs")}`
    );
    process.stdout.write(
      `${pc.dim("Type your question. Use /exit to leave.")}\n`
    );

    let active = true;
    while (active) {
      const question = await text({
        message: "You",
        placeholder: "How do I authenticate requests?",
      });

      if (isCancel(question)) {
        active = false;
        break;
      }

      const trimmed = String(question).trim();
      if (!trimmed) {
        continue;
      }
      if (trimmed === "/exit" || trimmed === "/quit") {
        active = false;
        break;
      }

      await answerOnce(mcp, trimmed);
    }

    outro(pc.dim("Bye — your docs MCP stays live for your editor."));
  } catch (error) {
    printError(error);
    process.exitCode = 1;
  }
}
