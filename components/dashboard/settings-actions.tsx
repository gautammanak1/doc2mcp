"use client";

import { Loader2, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ManageBillingButton({
  hasSubscription,
}: {
  hasSubscription: boolean;
}) {
  if (!hasSubscription) {
    return (
      <Button asChild type="button">
        <Link href="/pricing">Pick a plan</Link>
      </Button>
    );
  }
  return (
    <Button asChild type="button">
      <Link href="/pricing">Renew or change plan</Link>
    </Button>
  );
}

/**
 * Replaces a previous "fake submit" team-invite form that ran a 600ms
 * setTimeout and toasted a confusing "available once upgraded" message
 * without sending anything. There is no `Team` table, no `TeamMember`
 * table, and no `/api/teams/invite` route in this codebase — the prior
 * UI was misleading and broke user trust (#team-invite-bug).
 *
 * Until the real backend (teams, members, invite tokens, email delivery,
 * RLS policies) ships, render an honest "coming soon" card with a link
 * to register interest. The deferred design ticket tracks the full
 * Phase-2 plan including the schema and route handlers.
 */
export function TeamInviteForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users aria-hidden="true" className="size-4" />
          Team workspace
        </CardTitle>
        <CardDescription>
          Invite teammates to collaborate on doc2mcp projects, share MCP tokens,
          and split usage limits across a workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-dashed bg-muted/40 p-4">
          <div className="flex items-start gap-3">
            <Sparkles
              aria-hidden="true"
              className="mt-0.5 size-4 text-primary"
            />
            <div className="space-y-1">
              <p className="font-medium text-sm">Coming soon</p>
              <p className="text-muted-foreground text-sm">
                Multi-seat workspaces are on the roadmap. Today, each account is
                its own workspace. You can still share an MCP server URL with a
                teammate by sending them the per-project token from a project's{" "}
                <span className="font-medium">Connect</span> tab.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-xs">
          Want early access? Email{" "}
          <a
            className="underline underline-offset-2"
            href="mailto:hello@doc2mcp.site?subject=Team%20workspace%20early%20access"
          >
            hello@doc2mcp.site
          </a>
          .
        </p>
        <Button asChild size="sm" type="button" variant="outline">
          <Link href="/pricing">View plans</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function SignOutButton() {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <Button
      disabled={signingOut}
      onClick={handleSignOut}
      type="button"
      variant="outline"
    >
      {signingOut ? <Loader2 className="mr-1 size-3.5 animate-spin" /> : null}
      Sign out
    </Button>
  );
}
