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
import { cn } from "@/lib/utils";

function getSignUpErrorMessage(error: unknown) {
  const fallback = "We could not create your account. Please try again.";
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.toLowerCase();
  if (message.includes("email rate limit")) {
    return "Signup email limit is temporarily reached. Please try again in a few minutes, or contact support to activate your account.";
  }

  if (
    message.includes("already registered") ||
    message.includes("already exists")
  ) {
    return "An account already exists for this email. Please sign in instead.";
  }

  return error.message || fallback;
}

export function SignUpForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        router.replace("/post-login");
        router.refresh();
        return;
      }

      router.push("/auth/sign-up-success");
    } catch (signUpError: unknown) {
      setError(getSignUpErrorMessage(signUpError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
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

        <div className="flex flex-col gap-2">
          <Label
            className="font-normal text-muted-foreground"
            htmlFor="repeat-password"
          >
            Repeat password
          </Label>
          <PasswordInput
            className="h-10 rounded-lg border-border/50 bg-muted/50 text-sm transition-colors focus:border-foreground/20 focus:bg-muted"
            id="repeat-password"
            onChange={(event) => setRepeatPassword(event.target.value)}
            placeholder="********"
            required
            value={repeatPassword}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button className="relative w-full" disabled={isLoading} type="submit">
          {isLoading ? "Creating account..." : "Sign up"}
          {isLoading ? (
            <span className="absolute right-4 animate-spin">
              <LoaderIcon />
            </span>
          ) : null}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground">
        Have an account?{" "}
        <Link
          className="text-foreground underline-offset-4 hover:underline"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
