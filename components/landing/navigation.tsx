"use client";

import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Doc2McpLogo } from "@/components/doc2mcp/logo";
import { ThemeToggle } from "@/components/doc2mcp/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSupabaseAuth } from "@/lib/supabase/auth";

const NAV_LINKS = [
  { name: "Features", href: "/#features" },
  { name: "Playground", href: "/playground" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Compare", href: "/comparison" },
  { name: "Pricing", href: "/pricing" },
  { name: "Blog", href: "/blog" },
  { name: "Docs", href: "/docs" },
] as const;

export type LandingSessionInfo = {
  email: string;
  name?: string | null;
  initial: string;
  plan: string;
  isAdmin: boolean;
} | null;

function displayNameFor(session: NonNullable<LandingSessionInfo>): string {
  const raw = session.name?.trim();
  if (raw) {
    return raw;
  }
  const local = session.email.split("@")[0] ?? session.email;
  const cleaned = local
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) {
    return session.email;
  }
  return cleaned
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function LandingNavigation({
  session = null,
}: {
  session?: LandingSessionInfo;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 right-0 left-0 z-50 px-2 pt-2 sm:px-4 sm:pt-4">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 rounded-full border border-border/60 bg-background/80 px-3 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] backdrop-blur-xl sm:px-4"
      >
        <Link
          aria-label="doc2mcp home"
          className="flex shrink-0 items-center"
          href="/"
        >
          <Doc2McpLogo size={26} />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            // Hash-anchor links (e.g. "/#features") never show as active —
            // pathname doesn't include the hash, so multiple links would
            // collide on "/". Only real routes get the underline.
            const isHashLink = link.href.includes("#");
            const isActive = !isHashLink && pathname.startsWith(link.href);
            return (
              <a
                className={`relative rounded-full px-3 py-1.5 text-[13px] transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                href={link.href}
                key={link.name}
              >
                {link.name}
                {isActive ? (
                  <span className="absolute inset-x-3 bottom-0.5 h-px bg-foreground/30" />
                ) : null}
              </a>
            );
          })}
        </div>

        <div className="hidden items-center gap-1.5 md:flex">
          <ThemeToggle />
          {session ? (
            <UserMenu session={session} />
          ) : (
            <>
              <Button
                asChild
                className="h-8 rounded-full px-3 text-[13px] text-muted-foreground hover:text-foreground"
                size="sm"
                variant="ghost"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                className="group h-8 gap-1 rounded-full px-3.5 text-[13px]"
                size="sm"
              >
                <Link href="/chat">
                  Open app
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet onOpenChange={setIsMobileOpen} open={isMobileOpen}>
            <SheetTrigger asChild>
              <Button
                aria-label="Open menu"
                className="size-9 rounded-full"
                size="icon"
                variant="ghost"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              className="w-[88vw] max-w-sm border-border/60 bg-background/95 p-0 backdrop-blur-xl"
              side="right"
            >
              <SheetHeader className="px-5 pt-6 pb-2 text-left">
                <SheetTitle className="font-display text-base">
                  Navigation
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-xs">
                  Jump anywhere on doc2mcp
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-1 px-3 pb-3">
                {NAV_LINKS.map((link) => (
                  <a
                    className="rounded-lg px-3 py-2.5 text-[15px] text-foreground/85 hover:bg-muted hover:text-foreground"
                    href={link.href}
                    key={link.name}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <div className="border-border/60 border-t px-5 py-5">
                {session ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-foreground text-background font-medium text-xs">
                          {session.initial.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground text-sm">
                          {displayNameFor(session)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {session.isAdmin
                            ? "Administrator"
                            : `${session.plan} plan`}
                        </p>
                      </div>
                    </div>
                    <Button asChild className="w-full rounded-lg">
                      <Link
                        href={session.isAdmin ? "/admin" : "/dashboard"}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <LayoutDashboard className="mr-1.5 size-4" />
                        {session.isAdmin ? "Admin dashboard" : "Dashboard"}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Button
                      asChild
                      className="w-full rounded-lg"
                      variant="outline"
                    >
                      <Link
                        href="/login"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        Sign in
                      </Link>
                    </Button>
                    <Button asChild className="w-full rounded-lg">
                      <Link href="/chat" onClick={() => setIsMobileOpen(false)}>
                        Open app
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

function UserMenu({ session }: { session: NonNullable<LandingSessionInfo> }) {
  const router = useRouter();
  const { signOut } = useSupabaseAuth();
  const homeHref = session.isAdmin ? "/admin" : "/dashboard";
  const initial = session.initial.toUpperCase();
  const displayName = displayNameFor(session);
  const planLabel = session.isAdmin
    ? "admin"
    : session.plan === "free"
      ? "free"
      : session.plan;
  const planBadgeClass = session.isAdmin
    ? "border-foreground/20 bg-foreground/10 text-foreground"
    : session.plan === "free"
      ? "border-border bg-muted text-muted-foreground"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open account menu"
          className="group relative flex h-9 items-center gap-2 rounded-full border border-border/60 bg-background/70 py-1 pr-2.5 pl-1 transition-colors hover:border-foreground/30 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          type="button"
        >
          <Avatar className="size-7">
            <AvatarFallback className="bg-foreground font-medium text-[12px] text-background">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span
            className="hidden max-w-[140px] truncate font-medium text-[13px] text-foreground/90 group-hover:text-foreground lg:inline"
            title={displayName}
          >
            {displayName}
          </span>
          <span
            className={`hidden h-5 items-center gap-1 rounded-full border px-1.5 font-medium text-[10px] uppercase tracking-wide lg:inline-flex ${planBadgeClass}`}
          >
            {session.isAdmin ? (
              <>
                <ShieldCheck className="size-2.5" />
                admin
              </>
            ) : session.plan === "free" ? (
              "free"
            ) : (
              <>
                <Sparkles className="size-2.5" />
                {planLabel}
              </>
            )}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 rounded-xl border border-border/60 bg-popover/95 p-1.5 shadow-lg backdrop-blur-xl"
        sideOffset={10}
      >
        <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2">
          <Avatar className="size-9">
            <AvatarFallback className="bg-foreground font-medium text-background text-sm">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground text-sm">
              {displayName}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Badge
                className={`gap-1 px-1.5 py-0 text-[10px] ${planBadgeClass}`}
                variant="outline"
              >
                {session.isAdmin ? (
                  <>
                    <ShieldCheck className="size-2.5" />
                    Admin
                  </>
                ) : (
                  planLabel
                )}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2 rounded-md text-sm"
          onSelect={() => router.push(homeHref)}
        >
          <LayoutDashboard className="size-4" />
          {session.isAdmin ? "Admin dashboard" : "Dashboard"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2 rounded-md text-sm"
          onSelect={() => router.push("/dashboard/profile")}
        >
          <UserCircle className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2 rounded-md text-sm"
          onSelect={() => router.push("/chat")}
        >
          <Sparkles className="size-4" />
          New conversion
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2 rounded-md text-sm"
          onSelect={() => router.push("/pricing")}
        >
          <Settings className="size-4" />
          Billing & plans
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2 rounded-md text-destructive text-sm focus:text-destructive"
          onSelect={async () => {
            await signOut();
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
