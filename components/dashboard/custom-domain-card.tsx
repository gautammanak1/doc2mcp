/**
 * "Custom domain" card surfaced on the Settings page.
 *
 * The actual TLS/cert provisioning lives behind Team plan and a manual
 * onboarding (Vercel domain attachment + Supabase row), so this card
 * does two things today:
 *   1. Shows the user the DNS records they'd need to add.
 *   2. Routes them to support so we can attach the domain to their
 *      project. The form is intentionally a request-flow, not a
 *      self-service registration, until we wire the Vercel domains API.
 */

"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Globe2,
  Lock,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Plan = "free" | "starter" | "pro" | "team" | string;

type Props = {
  plan: Plan;
};

const REQUIRED_PLAN: Plan = "team";

const TARGET_HOST = "cname.doc2mcp.app";

const DNS_RECORDS = [
  {
    type: "CNAME",
    host: "mcp",
    value: TARGET_HOST,
    note: "Routes mcp.your-domain.com to doc2mcp's edge.",
  },
  {
    type: "TXT",
    host: "_doc2mcp",
    value: "doc2mcp-verify=<paste-from-support>",
    note: "One-time verification record we email after you request setup.",
  },
] as const;

export function CustomDomainCard({ plan }: Props) {
  const isEligible = plan === REQUIRED_PLAN;
  const [copied, setCopied] = useState<string | null>(null);

  function copy(value: string, label: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(label);
        toast.success(`${label} copied`);
        setTimeout(() => setCopied(null), 1500);
      })
      .catch(() => {
        toast.error("Could not copy. Long-press to select instead.");
      });
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe2 aria-hidden="true" className="size-4 text-foreground/80" />
          Custom domain
          <Badge variant={isEligible ? "default" : "secondary"}>
            {isEligible ? "Available on your plan" : "Team plan"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Serve your MCP server from{" "}
          <code className="font-mono text-foreground">mcp.your-domain.com</code>{" "}
          instead of the default <code className="font-mono">doc2mcp.site</code>{" "}
          URL. Great for vendor docs you ship to customers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ol className="space-y-3">
          <Step n={1} title="Pick a hostname">
            We recommend{" "}
            <code className="font-mono text-foreground">
              mcp.your-domain.com
            </code>{" "}
            so it&apos;s obvious to your team and customers what the endpoint is
            for. Any subdomain works — pick what fits your brand.
          </Step>
          <Step n={2} title="Add these DNS records at your registrar">
            <div className="mt-2 grid gap-2">
              {DNS_RECORDS.map((rec) => (
                <div
                  className="overflow-hidden rounded-xl border border-border/60 bg-muted/20"
                  key={`${rec.type}-${rec.host}`}
                >
                  <div className="grid gap-2 px-3 py-2.5 text-xs sm:grid-cols-[80px_1fr_auto] sm:items-center">
                    <span className="font-mono text-muted-foreground uppercase">
                      {rec.type}
                    </span>
                    <code className="truncate font-mono text-foreground">
                      <span className="text-muted-foreground">{rec.host}.</span>
                      your-domain.com → {rec.value}
                    </code>
                    <Button
                      className="h-7 px-2 text-xs"
                      onClick={() => copy(rec.value, `${rec.type} value`)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {copied === `${rec.type} value` ? (
                        <Check className="size-3" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span className="ml-1 hidden sm:inline">Copy</span>
                    </Button>
                  </div>
                  <p className="border-border/40 border-t bg-background/30 px-3 py-2 text-[11px] text-muted-foreground">
                    {rec.note}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground/80">
              Common registrars: Cloudflare, Namecheap, GoDaddy, AWS Route 53,
              Google Domains. TTL: <code className="font-mono">3600</code> (or
              Auto) is fine.
            </p>
          </Step>
          <Step n={3} title="Request domain attachment">
            DNS propagation usually takes 1–10 minutes. Once that&apos;s done,
            email us with your domain and project ID and we&apos;ll attach it,
            issue the TLS certificate via Let&apos;s Encrypt, and confirm.
          </Step>
          <Step n={4} title="Update your MCP client config">
            Swap{" "}
            <code className="font-mono text-foreground">
              https://doc2mcp.site/api/mcp/&lt;id&gt;/mcp
            </code>{" "}
            for{" "}
            <code className="font-mono text-foreground">
              https://mcp.your-domain.com/api/mcp/&lt;id&gt;/mcp
            </code>{" "}
            in Cursor, Claude Desktop, Windsurf, or your client of choice. The
            Bearer token doesn&apos;t change.
          </Step>
        </ol>

        <div
          className={cn(
            "flex flex-col gap-3 rounded-xl border border-border/40 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
          )}
        >
          <div className="flex items-start gap-2">
            <Lock
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-foreground/80"
            />
            <p className="text-foreground/85 text-sm">
              {isEligible ? (
                <>
                  You&apos;re on the Team plan — custom domains are included.
                  Add records, then click below to request attachment.
                </>
              ) : (
                <>
                  Custom domains are part of the Team plan. Upgrade or talk to
                  the founders if you need it on your current plan.
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" type="button" variant="outline">
              <a href="/contact?topic=Partnership%20%2F%20press&prefill=custom-domain">
                <Sparkles aria-hidden="true" className="mr-1.5 size-3.5" />
                Request setup
              </a>
            </Button>
            <Button asChild size="sm" type="button" variant="ghost">
              <a
                href="https://docs.doc2mcp.site/custom-domains"
                rel="noopener noreferrer"
                target="_blank"
              >
                <ExternalLink aria-hidden="true" className="mr-1.5 size-3.5" />
                Docs
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 font-mono text-[11px] text-foreground/80">
        {n}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-display font-semibold text-sm">{title}</p>
        <div className="text-muted-foreground text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </li>
  );
}
