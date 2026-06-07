import type { Metadata } from "next";
import { PlaygroundExperience } from "@/components/playground/playground-experience";

export const metadata: Metadata = {
  title: "Playground — doc2mcp",
  description:
    "Paste a documentation URL and watch the doc2mcp agent crawl it into a hosted MCP server. Grab the CLI or editor config in one click.",
};

export default function PlaygroundPage() {
  return <PlaygroundExperience />;
}
