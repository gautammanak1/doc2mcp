import {
  ArrowLeft,
  Boxes,
  ExternalLink,
  FileText,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { FooterSection } from "@/components/landing/footer-section";
import { LandingNavigation } from "@/components/landing/navigation";
import { InstallPanel } from "@/components/marketplace/install-panel";
import { Button } from "@/components/ui/button";
import { getMarketplaceProjectById } from "@/lib/db/queries";
import { buildInstallTargets } from "@/lib/marketplace/install";
import { toMarketplaceMcpDetail } from "@/lib/marketplace/transform";
import { SOURCE_TYPE_LABELS } from "@/lib/marketplace/types";

type Params = { id: string };

export const metadata: Metadata = {
  title: "MCP server — doc2mcp marketplace",
  description:
    "Install a doc2mcp-generated MCP server in Cursor or VS Code with one click.",
};

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 font-display font-semibold text-foreground text-xl">
        {value}
      </p>
    </div>
  );
}

function MarketplaceDetailFallback() {
  return (
    <article className="relative mx-auto max-w-4xl px-6 pt-32 pb-16 lg:px-8">
      <div className="h-3 w-28 rounded-full bg-muted" />
      <div className="mt-8 flex items-start gap-4">
        <div className="size-14 rounded-2xl bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-40 rounded-full bg-muted" />
          <div className="h-10 w-full max-w-md rounded-full bg-muted" />
          <div className="h-4 w-full max-w-lg rounded-full bg-muted" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {["tools", "pages", "endpoints", "score"].map((item) => (
          <div
            className="h-24 rounded-xl border border-border/50 bg-card/40"
            key={item}
          />
        ))}
      </div>
    </article>
  );
}

export default function MarketplaceDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  return (
    <main className="landing-page relative min-h-screen overflow-x-hidden">
      <Suspense fallback={<MarketplaceDetailFallback />}>
        <LandingNavigation />
        <MarketplaceDetailContent params={params} />
        <FooterSection />
      </Suspense>
    </main>
  );
}

async function MarketplaceDetailContent({
  params,
}: {
  params: Promise<Params>;
}) {
  await connection();
  const { id } = await params;
  const row = await getMarketplaceProjectById(id);
  if (!row) {
    notFound();
  }
  const mcp = toMarketplaceMcpDetail(row);
  const installTargets = buildInstallTargets(row.artifacts);

  return (
    <article className="relative mx-auto max-w-4xl px-6 pt-32 pb-16 lg:px-8">
        <Link
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.18em] hover:text-foreground"
          href="/marketplace"
        >
          <ArrowLeft className="size-3" />
          Marketplace
        </Link>

        <header className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-card/60">
              <Boxes className="size-7 text-violet-500" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                <span className="rounded-full bg-muted/60 px-2.5 py-0.5 font-medium">
                  {SOURCE_TYPE_LABELS[mcp.sourceType]}
                </span>
                <span>·</span>
                <span>by {mcp.ownerName}</span>
              </div>
              <h1 className="mt-2 font-display font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
                {mcp.name}
              </h1>
              {mcp.sourceUrl ? (
                <a
                  className="mt-2 inline-flex items-center gap-1.5 text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline"
                  href={mcp.sourceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="size-3.5" />
                  {mcp.sourceUrl}
                </a>
              ) : null}
            </div>
          </div>
          <Button asChild className="shrink-0 gap-1.5 rounded-full">
            <Link href="/chat">
              <Sparkles className="size-4" />
              Generate your own
            </Link>
          </Button>
        </header>

        {mcp.summary ? (
          <p className="mt-8 text-foreground/85 text-lg leading-relaxed">
            {mcp.summary}
          </p>
        ) : null}

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile
            icon={<Wrench className="size-3.5" />}
            label="Tools"
            value={String(mcp.toolCount)}
          />
          <StatTile
            icon={<FileText className="size-3.5" />}
            label="Pages"
            value={String(mcp.pageCount)}
          />
          <StatTile
            icon={<Boxes className="size-3.5" />}
            label="Endpoints"
            value={String(mcp.endpointCount)}
          />
          <StatTile
            icon={<Sparkles className="size-3.5" />}
            label="MCP score"
            value={mcp.mcpScore === null ? "—" : String(mcp.mcpScore)}
          />
        </div>

        {installTargets ? <InstallPanel targets={installTargets} /> : null}

        {mcp.tools.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-display font-semibold text-foreground text-xl tracking-tight">
              Tools ({mcp.tools.length})
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              The capabilities this MCP server exposes to AI agents.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {mcp.tools.map((tool) => (
                <div
                  className="rounded-xl border border-border/50 bg-card/40 p-4"
                  key={tool.name}
                >
                  <p className="inline-flex items-center gap-1.5 font-mono font-medium text-foreground text-sm">
                    <Wrench className="size-3.5 text-violet-500" />
                    {tool.name}
                  </p>
                  <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-14 rounded-2xl border border-border/50 bg-card/40 p-6 sm:p-8">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
            Build yours
          </p>
          <p className="mt-3 font-display font-semibold text-foreground text-xl sm:text-2xl">
            Turn your documentation into an MCP server like this.
          </p>
          <p className="mt-2 text-muted-foreground text-sm">
            Paste a docs URL and it&apos;s published to the marketplace
            automatically once ready. Works with Cursor, Claude, VS Code,
            Windsurf, and OpenAI Agents.
          </p>
          <Button asChild className="mt-5 gap-1.5 rounded-full">
            <Link href="/chat">
              Generate your MCP
              <Sparkles className="size-4" />
            </Link>
          </Button>
        </div>
    </article>
  );
}
