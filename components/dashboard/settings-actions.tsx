"use client";

import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
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
