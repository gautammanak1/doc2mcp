"use client";

import { LayoutDashboard, Menu, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Doc2McpLogo } from "@/components/doc2mcp/logo";
import { ThemeToggle } from "@/components/doc2mcp/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "How it works", href: "/#how-it-works" },
  { name: "Compare", href: "/comparison" },
  { name: "Pricing", href: "/pricing" },
  { name: "Docs", href: "/docs" },
];

export type LandingSessionInfo = {
  email: string;
  initial: string;
  plan: string;
  isAdmin: boolean;
} | null;

export function LandingNavigation({
  session = null,
}: {
  session?: LandingSessionInfo;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled
          ? "top-2 right-2 left-2 sm:top-4 sm:right-4 sm:left-4"
          : "top-0 right-0 left-0"
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "max-w-[1280px] rounded-2xl border border-foreground/10 bg-background/80 shadow-lg backdrop-blur-xl"
            : "max-w-[1280px] bg-transparent"
        }`}
      >
        <div
          className={`flex items-center justify-between px-4 transition-all duration-500 sm:px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          <Link className="transition-all duration-500" href="/">
            <Doc2McpLogo size={isScrolled ? 26 : 32} />
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <a
                className="group relative text-foreground/70 text-sm transition-colors duration-300 hover:text-foreground"
                href={link.href}
                key={link.name}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {session ? (
              <>
                <Link
                  className={`group flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-2 py-1 pr-3 transition-all duration-300 hover:bg-foreground/5 ${
                    isScrolled ? "scale-95" : ""
                  }`}
                  href={session.isAdmin ? "/admin" : "/dashboard/profile"}
                  title={session.email}
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 font-semibold text-[11px] text-white">
                    {session.initial}
                  </span>
                  <span className="hidden truncate text-foreground/80 text-xs lg:inline-block lg:max-w-[140px]">
                    {session.email}
                  </span>
                  <Badge
                    className={`gap-1 px-1.5 py-0 text-[10px] ${
                      session.isAdmin
                        ? "border-violet-500/30 bg-violet-500/15 text-violet-700 dark:text-violet-300"
                        : session.plan === "free"
                          ? "border-foreground/15 bg-muted text-muted-foreground"
                          : "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    }`}
                    variant="outline"
                  >
                    {session.isAdmin ? (
                      <>
                        <ShieldCheck className="size-2.5" />
                        Admin
                      </>
                    ) : (
                      session.plan
                    )}
                  </Badge>
                </Link>
                <Button
                  asChild
                  className={`rounded-full bg-foreground text-background transition-all duration-500 hover:bg-foreground/90 ${
                    isScrolled ? "h-8 px-4 text-xs" : "px-6"
                  }`}
                  size="sm"
                >
                  <Link href={session.isAdmin ? "/admin" : "/dashboard"}>
                    <LayoutDashboard className="mr-1.5 size-3.5" />
                    Dashboard
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Link
                  className={`text-foreground/70 transition-all duration-500 hover:text-foreground ${
                    isScrolled ? "text-xs" : "text-sm"
                  }`}
                  href="/login"
                >
                  Sign in
                </Link>
                <Button
                  asChild
                  className={`rounded-full bg-foreground text-background transition-all duration-500 hover:bg-foreground/90 ${
                    isScrolled ? "h-8 px-4 text-xs" : "px-6"
                  }`}
                  size="sm"
                >
                  <Link href="/chat">Open app</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="p-2 md:hidden"
            onClick={() => setIsMobileMenuOpen((o) => !o)}
            type="button"
          >
            {isMobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-foreground/10 border-t px-4 py-4 md:hidden">
            {navLinks.map((link) => (
              <a
                className="block py-3 text-foreground/80 text-sm"
                href={link.href}
                key={link.name}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              {session ? (
                <>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-foreground/10 bg-background/40 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 font-semibold text-white text-xs">
                        {session.initial}
                      </span>
                      <span className="truncate text-foreground/80 text-xs">
                        {session.email}
                      </span>
                    </div>
                    <Badge
                      className={`shrink-0 text-[10px] ${
                        session.isAdmin
                          ? "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                      variant="outline"
                    >
                      {session.isAdmin ? "Admin" : session.plan}
                    </Badge>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={session.isAdmin ? "/admin" : "/dashboard"}>
                      <LayoutDashboard className="mr-1.5 size-3.5" />
                      Open dashboard
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/chat">Open app</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
