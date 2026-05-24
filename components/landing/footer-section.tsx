"use client";

import { Github, Linkedin, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Doc2McpLogo } from "@/components/doc2mcp/logo";
import { CONTACT_EMAIL, GITHUB_REPO_URL } from "@/lib/config/site";

const FEATURES_LINKS = [
  { label: "Chat", href: "/chat" },
  { label: "Demo", href: "/demo" },
  { label: "Capabilities", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
];

const RESOURCES_LINKS = [
  { label: "Docs", href: "/docs" },
  { label: "Getting started", href: "/docs/getting-started" },
  { label: "Workflow", href: "/docs/workflow" },
  { label: "Security", href: "/docs/security" },
];

const LEGAL_LINKS = [
  { label: "Terms", href: "/docs/terms" },
  { label: "Privacy", href: "/docs/privacy" },
  { label: "Acceptable use", href: "/docs/acceptable-use" },
  { label: "Trust center", href: "/docs/security" },
];

const SOCIAL_LINKS = [
  { label: "X / Twitter", href: "https://x.com/doc2mcp", icon: Twitter },
  { label: "YouTube", href: "https://youtube.com/@doc2mcp", icon: Youtube },
  { label: "GitHub", href: GITHUB_REPO_URL, icon: Github },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/doc2mcp",
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
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-16">
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
            {" · "}Powered by ASI1 · hosted on Vercel
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none mt-12 select-none overflow-hidden text-center"
      >
        <p className="-mb-4 bg-gradient-to-b from-foreground/10 to-foreground/0 bg-clip-text font-display font-bold leading-none tracking-tight text-transparent text-[clamp(3rem,14vw,18rem)] sm:-mb-10 lg:-mb-16">
          doc2mcp
        </p>
      </div>
    </footer>
  );
}
