"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LoaderIcon } from "@/components/chat/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function LoginForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl") ?? "/";

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        throw signInError;
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (loginError: unknown) {
      setError(
        loginError instanceof Error ? loginError.message : "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async () => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/oauth?next=${encodeURIComponent(redirectUrl)}`,
        },
      });
      if (oauthError) {
        throw oauthError;
      }
    } catch (oauthError: unknown) {
      setError(
        oauthError instanceof Error
          ? oauthError.message
          : "An OAuth error occurred"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Button
        className="w-full"
        disabled={isLoading}
        onClick={handleSocialLogin}
        type="button"
        variant="outline"
      >
        Sign in with Google
      </Button>

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

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
