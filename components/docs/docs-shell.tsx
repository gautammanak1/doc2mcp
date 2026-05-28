import { Menu } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Doc2McpLogo } from "@/components/doc2mcp/logo";
import { ThemeToggle } from "@/components/doc2mcp/theme-toggle";
import { DocsMobileNavLoader } from "@/components/docs/docs-mobile-nav-loader";
import { DocsSidebarLoader } from "@/components/docs/docs-sidebar-loader";
import { Button } from "@/components/ui/button";

function SidebarFallback() {
  return (
    <div className="w-full">
      <div className="mb-3 h-3 w-24 animate-pulse rounded bg-muted" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            className="h-9 animate-pulse rounded-lg bg-muted/60"
            key={`doc-nav-skel-${String(i)}`}
          />
        ))}
      </div>
    </div>
  );
}

function MobileNavFallback() {
  return (
    <Button
      aria-label="Open documentation menu"
      className="lg:hidden"
      disabled
      size="icon-sm"
      variant="ghost"
    >
      <Menu className="size-4" />
    </Button>
  );
}

export function DocPageFallback() {
  return (
    <div className="space-y-4">
      <div className="h-9 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-muted/60" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-muted/60" />
      <div className="mt-8 h-64 animate-pulse rounded-xl bg-muted/60" />
    </div>
  );
}

export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-border/60 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2">
            <Suspense fallback={<MobileNavFallback />}>
              <DocsMobileNavLoader />
            </Suspense>
            <Link className="flex shrink-0 items-center" href="/">
              <Doc2McpLogo size={28} />
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-sm sm:gap-3">
            <Link
              className="hidden text-muted-foreground hover:text-foreground sm:inline"
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
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-0 px-4 sm:px-6 lg:flex-row lg:gap-12 lg:py-0">
        <aside className="hidden w-56 shrink-0 lg:sticky lg:top-[72px] lg:block lg:h-[calc(100dvh-72px)] lg:overflow-y-auto lg:py-10 lg:pr-2">
          <Suspense fallback={<SidebarFallback />}>
            <DocsSidebarLoader />
          </Suspense>
        </aside>
        <div className="min-w-0 flex-1 py-8 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
