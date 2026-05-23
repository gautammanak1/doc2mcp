import Link from "next/link";
import { Suspense } from "react";
import { Doc2McpLogo } from "@/components/doc2mcp/logo";
import { ThemeToggle } from "@/components/doc2mcp/theme-toggle";
import { DocsSidebarLoader } from "@/components/docs/docs-sidebar-loader";

function SidebarFallback() {
  return (
    <aside className="w-full shrink-0 lg:w-56">
      <div className="mb-3 h-3 w-24 animate-pulse rounded bg-white/10" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            className="h-9 animate-pulse rounded-lg bg-white/5"
            key={`doc-nav-skel-${String(i)}`}
          />
        ))}
      </div>
    </aside>
  );
}

export function DocPageFallback() {
  return (
    <div className="space-y-4">
      <div className="h-9 w-2/3 animate-pulse rounded bg-white/10" />
      <div className="h-4 w-full animate-pulse rounded bg-white/5" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-white/5" />
      <div className="mt-8 h-64 animate-pulse rounded-xl bg-white/5" />
    </div>
  );
}

export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Doc2McpLogo size={28} />
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              className="text-muted-foreground hover:text-foreground"
              href="/"
            >
              Home
            </Link>
            <Link
              className="text-muted-foreground hover:text-foreground"
              href="/chat"
            >
              App
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 lg:flex-row">
        <Suspense fallback={<SidebarFallback />}>
          <DocsSidebarLoader />
        </Suspense>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
