import type { Metadata } from "next";
import { CliLanding } from "@/components/cli/cli-landing";

export const metadata: Metadata = {
  title: "doc2mcp CLI — Turn Docs Into MCP From Your Terminal",
  description:
    "Install the doc2mcp CLI to convert any documentation URL into a hosted, token-secured MCP server, install it into Cursor/VS Code/Claude/Windsurf, and chat with your docs — all from the terminal.",
};

export default function CliPage() {
  return <CliLanding />;
}
