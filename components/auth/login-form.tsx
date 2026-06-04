"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderIcon } from "@/components/chat/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import { isSupabasePublicConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  redirectUrl,
}: {
  className?: string;
  redirectUrl?: string | null;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const postLoginUrl = redirectUrl
    ? `/post-login?redirectUrl=${encodeURIComponent(redirectUrl)}`
    : "/post-login";

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabasePublicConfigured()) {
        setError("Authentication is not configured for this deployment.");
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        throw signInError;
      }

      router.replace(postLoginUrl);
      router.refresh();
    } catch (loginError: unknown) {
      setError(
        loginError instanceof Error ? loginError.message : "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <form className="flex flex-col gap-4" onSubmit={handleLogin}>
        <div className="flex flex-col gap-2">
          <Label className="font-normal text-muted-foreground" htmlFor="email">
            Email
          </Label>
          <Input
            autoComplete="email"
            autoFocus
            className="h-10 rounded-lg border-border/50 bg-muted/50 text-sm transition-colors focus:border-foreground/20 focus:bg-muted"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            className="font-normal text-muted-foreground"
            htmlFor="password"
          >
            Password
          </Label>
          <PasswordInput
            className="h-10 rounded-lg border-border/50 bg-muted/50 text-sm transition-colors focus:border-foreground/20 focus:bg-muted"
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            required
            value={password}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button className="relative w-full" disabled={isLoading} type="submit">
          {isLoading ? "Signing in..." : "Sign in"}
          {isLoading ? (
            <span className="absolute right-4 animate-spin">
              <LoaderIcon />
            </span>
          ) : null}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground">
        No account?{" "}
        <Link
          className="text-foreground underline-offset-4 hover:underline"
          href="/register"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
