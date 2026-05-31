/**
 * Public callout shown on every "your MCP server is ready" surface (the
 * post-convert experience and the dashboard project Connect/Inspector
 * panels). Links users to the live entry in the official MCP Registry so
 * they can verify the server is real, share the canonical URL, and point
 * AI hosts (Cursor / Claude Desktop / ChatGPT) at the registered server
 * record instead of an unverified ad-hoc endpoint.
 *
 * NOTE: the registry entry itself only carries the doc2mcp PRIMITIVE — a
 * remote streamable-http server template at
 * `https://doc2mcp.site/api/mcp/{project_id}/mcp`. Each end-user's
 * `project_id` and Bearer token are still per-account and are NOT in the
 * public registry; they live on the user's dashboard. This banner is
 * informational, not a credential exposure.
 */

import { BadgeCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REGISTRY_SEARCH_URL =
  "https://registry.modelcontextprotocol.io/v0.1/servers?search=doc2mcp";
const REGISTRY_NAME = "io.github.doc2mcp/doc2mcp";

export function McpRegistryBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-sky-500/25 bg-sky-500/10 p-5",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <BadgeCheck aria-hidden="true" className="mt-0.5 size-5 text-sky-300" />
        <div className="min-w-0 space-y-2">
          <p className="font-medium text-sky-100 text-sm">
            Published to the official MCP Registry
          </p>
          <p className="text-muted-foreground text-sm">
            doc2mcp is listed in the canonical{" "}
            <a
              className="font-mono text-foreground underline underline-offset-2"
              href={REGISTRY_SEARCH_URL}
              rel="noreferrer noopener"
              target="_blank"
            >
              Model Context Protocol Registry
            </a>{" "}
            as{" "}
            <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-foreground">
              {REGISTRY_NAME}
            </code>
            . AI hosts can verify the server identity and resolve the latest
            endpoint metadata directly from the registry.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button asChild size="sm" type="button" variant="outline">
              <a
                href={REGISTRY_SEARCH_URL}
                rel="noreferrer noopener"
                target="_blank"
              >
                <ExternalLink aria-hidden="true" className="mr-1 size-3.5" />
                View registry entry
              </a>
            </Button>
            <Button asChild size="sm" type="button" variant="ghost">
              <a
                href="https://github.com/doc2mcp/doc2mcp"
                rel="noreferrer noopener"
                target="_blank"
              >
                <ExternalLink aria-hidden="true" className="mr-1 size-3.5" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
