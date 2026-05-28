"use client";

import { ExternalLink, Loader2, Mail, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BillingPortalButton({
  hasSubscription,
}: {
  hasSubscription: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error("Unable to open billing portal. Try again later.");
    } catch {
      toast.error("Network error opening billing portal.");
    } finally {
      setLoading(false);
    }
  };

  if (!hasSubscription) {
    return (
      <Button asChild type="button">
        <a href="/pricing">Pick a plan</a>
      </Button>
    );
  }

  return (
    <Button disabled={loading} onClick={handleOpen} type="button">
      {loading ? (
        <Loader2 className="mr-1 size-3.5 animate-spin" />
      ) : (
        <ExternalLink className="mr-1 size-3.5" />
      )}
      Open billing portal
    </Button>
  );
}

type SyncResponse = {
  ok?: boolean;
  synced?: number;
  planId?: string;
  status?: string;
  reason?: string;
  message?: string;
  error?: string;
};

export function RefreshSubscriptionButton({
  variant = "outline",
  size = "default",
}: {
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "default" | "sm";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    const toastId = toast.loading("Refreshing subscription from Stripe…");
    try {
      const res = await fetch("/api/stripe/sync", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as SyncResponse;
      if (!res.ok) {
        toast.error(data.message ?? data.error ?? "Sync failed", {
          id: toastId,
        });
        return;
      }
      if (data.ok && data.planId && data.planId !== "free") {
        toast.success(
          `Plan updated to ${data.planId.charAt(0).toUpperCase()}${data.planId.slice(1)}`,
          {
            id: toastId,
            description: data.status ? `Status: ${data.status}` : undefined,
          }
        );
        router.refresh();
      } else if (data.reason === "no_subscriptions") {
        toast.message("No active subscription in Stripe yet", {
          id: toastId,
          description:
            "If you just checked out, give Stripe a minute and try again.",
        });
      } else if (data.reason === "no_stripe_customer") {
        toast.message("No checkout on record", {
          id: toastId,
          description: "Start a plan from /pricing to subscribe.",
        });
      } else {
        toast.message("Nothing to refresh", {
          id: toastId,
          description: data.message ?? "Subscription is already up to date.",
        });
        router.refresh();
      }
    } catch {
      toast.error("Network error talking to Stripe", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      disabled={loading}
      onClick={handleRefresh}
      size={size}
      type="button"
      variant={variant}
    >
      {loading ? (
        <Loader2 className="mr-1 size-3.5 animate-spin" />
      ) : (
        <RefreshCw className="mr-1 size-3.5" />
      )}
      Refresh subscription
    </Button>
  );
}

export function TeamInviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.info(
        "Team invitations will be available once your workspace is upgraded to a Team plan."
      );
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team workspace</CardTitle>
        <CardDescription>
          Invite teammates to collaborate on conversions. Available on the Team
          plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email address</Label>
            <div className="relative">
              <Mail className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                id="invite-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teammate@company.com"
                required
                type="email"
                value={email}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              id="invite-role"
              onChange={(event) => setRole(event.target.value)}
              value={role}
            >
              <option value="member">Member · can run conversions</option>
              <option value="admin">Admin · can manage billing</option>
              <option value="owner">Owner · full access</option>
            </select>
          </div>
          <Button className="w-full" disabled={submitting} type="submit">
            {submitting ? (
              <Loader2 className="mr-1 size-3.5 animate-spin" />
            ) : null}
            Send invite
          </Button>
        </form>
      </CardContent>
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
