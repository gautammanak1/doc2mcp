"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Doc2McpLogo } from "@/components/doc2mcp/logo";
import { ThemeToggle } from "@/components/doc2mcp/theme-toggle";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "How it works", href: "/#how-it-works" },
  { name: "Pricing", href: "/pricing" },
  { name: "Docs", href: "/docs" },
];

export function LandingNavigation() {
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
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/chat">Open app</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
