"use client";

import { Calendar, Github, Heart, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Doc2McpLogo } from "@/components/doc2mcp/logo";
import { CONTACT_EMAIL } from "@/lib/config/site";

const FEATURES_LINKS = [
  { label: "Chat", href: "/chat" },
  { label: "Demo", href: "/demo" },
  { label: "Capabilities", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
];

const RESOURCES_LINKS = [
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
  { label: "Getting started", href: "/docs/getting-started" },
  { label: "Workflow", href: "/docs/workflow" },
  { label: "Security", href: "/docs/security" },
];

const LEGAL_LINKS = [
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund & Cancellation", href: "/refund-policy" },
  { label: "Contact us", href: "/contact" },
];

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/Meerut-code-hub",
    icon: Github,
  },
  {
    label: "X / Twitter",
    href: "https://twitter.com/MeerutCodehub",
    icon: Twitter,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/meerutcodehub/",
    icon: Linkedin,
  },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        &lt;{title}&gt;
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              className="text-foreground/80 text-sm transition-colors hover:text-foreground"
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FooterSection() {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative overflow-hidden border-border/40 border-t bg-background pt-16 sm:pt-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-16">
          <div className="space-y-6">
            <Link className="inline-flex items-center gap-2" href="/">
              <Doc2McpLogo size={32} />
            </Link>
            <p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
              The fastest way to turn any documentation into an MCP server your
              AI agents can read.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-full border border-border/40 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                    href={social.href}
                    key={social.label}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <a
                aria-label="Book a 30-minute demo on Calendly"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3.5 text-foreground/80 text-xs transition-colors hover:border-border hover:text-foreground"
                href="https://calendly.com/doc2mcp/30min"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Calendar aria-hidden="true" className="size-3.5" />
                <span className="font-medium">Book a demo</span>
              </a>
              <a
                aria-label="Sponsor gautammanak1 on GitHub"
                className="group inline-flex h-9 items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 text-pink-700 text-xs transition-colors hover:border-pink-500/60 hover:bg-pink-500/15 dark:text-pink-300"
                href="https://github.com/sponsors/gautammanak1"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Heart
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:scale-110"
                  fill="currentColor"
                />
                <span className="font-medium">Sponsor on GitHub</span>
              </a>
            </div>
          </div>

          <FooterColumn links={FEATURES_LINKS} title="Features" />
          <FooterColumn links={RESOURCES_LINKS} title="Resources" />
          <FooterColumn links={LEGAL_LINKS} title="Legal" />
        </div>

        <div className="mt-16 flex flex-col gap-4 border-border/40 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">
            © {currentYear} doc2mcp. All rights reserved.
          </p>
          <p className="font-mono text-[11px] text-muted-foreground/80">
            <a
              className="hover:text-foreground"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
            {" · Built by "}
            <a
              className="font-medium text-foreground/90 underline decoration-foreground/20 decoration-dotted underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/60"
              href="https://www.linkedin.com/company/meerutcodehub/"
              rel="noopener noreferrer"
              target="_blank"
            >
              MeerutCodeHub
            </a>
          </p>
        </div>
      </div>

      <AnimatedWordmark />
    </footer>
  );
}

function AnimatedWordmark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none mt-12 select-none overflow-hidden text-center"
    >
      <p className="-mb-4 footer-wordmark bg-gradient-to-b from-foreground/15 via-foreground/5 to-foreground/0 bg-clip-text font-display font-bold leading-none tracking-tight text-transparent text-[clamp(3rem,14vw,18rem)] sm:-mb-10 lg:-mb-16">
        doc2mcp
      </p>
      <style>{`
        .footer-wordmark {
          background-size: 200% 200%;
          animation: wordmark-shimmer 8s ease-in-out infinite;
        }
        @keyframes wordmark-shimmer {
          0%, 100% {
            background-position: 0% 50%;
            filter: drop-shadow(0 0 0 rgba(168, 85, 247, 0));
          }
          50% {
            background-position: 100% 50%;
            filter: drop-shadow(0 8px 32px rgba(168, 85, 247, 0.18));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .footer-wordmark { animation: none; }
        }
      `}</style>
    </div>
  );
}
