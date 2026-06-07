#!/usr/bin/env node

import { Command } from "commander";
import pc from "picocolors";
import { runWhoami, runLogout } from "./commands/account.js";
import { runConvert, runList } from "./commands/convert.js";
import { runInstallCommand } from "./commands/install.js";
import { runLogin } from "./commands/login.js";

const program = new Command();

program
  .name("doc2mcp")
  .description("Generate documentation MCP servers from your terminal")
  .version("0.1.0");

program
  .command("login")
  .description("Authorize the CLI via browser")
  .action(async () => {
    await runLogin();
  });

program
  .command("logout")
  .description("Remove stored credentials")
  .action(async () => {
    await runLogout();
  });

program
  .command("whoami")
  .description("Show the logged-in user")
  .action(async () => {
    await runWhoami();
  });

program
  .command("list")
  .description("List your MCP projects")
  .action(async () => {
    await runList();
  });

program
  .command("install <projectId>")
  .description("Install an existing MCP into Cursor, VS Code, Claude, or Windsurf")
  .action(async (projectId: string) => {
    await runInstallCommand(projectId);
  });

program
  .argument("[url]", "Documentation URL to convert")
  .action(async (url?: string) => {
    if (!url) {
      program.help();
      return;
    }

    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("URL must start with http:// or https://");
      }
    } catch {
      process.stderr.write(
        `${pc.red("Error:")} Invalid URL. Example: doc2mcp https://docs.example.com\n`
      );
      process.exitCode = 1;
      return;
    }

    await runConvert(url);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  process.stderr.write(`${pc.red("Error:")} ${message}\n`);
  process.exit(1);
});
