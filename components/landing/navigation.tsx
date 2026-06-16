"use client";

import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  ArrowUpRight,
  BookOpen,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  Menu,
  Sliders,
  Store,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Doc2McpLogo } from "@/components/doc2mcp/logo";
import { ThemeToggle } from "@/components/doc2mcp/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Features", href: "/#features", icon: Sliders },
  { name: "CLI", href: "/cli", icon: Terminal },
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "Compare", href: "/comparison", icon: ArrowLeftRight },
  { name: "Pricing", href: "/pricing", icon: CreditCard },
  { name: "Blog", href: "/blog", icon: BookOpen },
  { name: "Docs", href: "/docs", icon: FileText },
] as const;

/** Onboarding-tour anchors keyed by nav href. */
const TOUR_ANCHORS: Record<string, string> = {
  "/cli": "nav-cli",
  "/pricing": "nav-pricing",
};

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 px-2 pt-2 sm:px-4 sm:pt-4">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between gap-3 rounded-full border border-border/60 bg-card/80 px-3 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] backdrop-blur-xl sm:px-4"
      >
        {/* Left logo */}
        <Link
          aria-label="doc2mcp home"
          className="flex shrink-0 items-center transition-opacity hover:opacity-85"
          href="/"
        >
          <Doc2McpLogo size={26} />
        </Link>

        {/* Center nav items */}
        <div className="hidden items-center gap-1.5 md:flex">
          {NAV_LINKS.map((link) => {
            const isHome = link.href === "/";
            const isHashLink = link.href.includes("#");
            const isActive = isHome
              ? pathname === "/"
              : !isHashLink && pathname.startsWith(link.href);

            const Icon = link.icon;

            return (
              <a
                className={cn(
                  "relative rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1.5 z-10",
                  isActive
                    ? "text-[#4285f4] dark:text-[#8ab4f8] font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                data-tour={TOUR_ANCHORS[link.href]}
                href={link.href}
                key={link.name}
              >
                <Icon className="size-3.5" />
                <span>{link.name}</span>
                {isActive && mounted && (
                  <motion.span
                    className="absolute inset-0 -z-10 rounded-full bg-[#e9eef6] dark:bg-[#282a2d]"
                    layoutId="active-nav-bg"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="hidden items-center gap-2 md:flex" data-tour="nav-cta">
          <ThemeToggle />
          {session ? (
            <Button
              asChild
              className="group h-8.5 gap-1.5 rounded-full px-4 text-xs font-medium bg-[#4285f4] dark:bg-[#8ab4f8] text-white dark:text-[#131314] hover:opacity-90 border-0"
              size="sm"
            >
              <Link href={session.isAdmin ? "/admin" : "/dashboard"}>
                <LayoutDashboard aria-hidden="true" className="size-3.5" />
                {session.isAdmin ? "Admin" : "Dashboard"}
                <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                className="h-8.5 rounded-full px-3.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                size="sm"
                variant="ghost"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                className="group h-8.5 gap-1 rounded-full px-4 text-xs font-medium bg-[#4285f4] dark:bg-[#8ab4f8] text-white dark:text-[#131314] hover:opacity-90 border-0"
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

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-1.5 md:hidden">
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
