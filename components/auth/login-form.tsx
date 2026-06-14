"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { type LoginActionState, login } from "@/app/(auth)/actions";
import { LoaderIcon } from "@/components/chat/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  redirectUrl,
}: {
  className?: string;
  redirectUrl?: string | null;
}) {
  const router = useRouter();
  const postLoginUrl = redirectUrl
    ? `/post-login?redirectUrl=${encodeURIComponent(redirectUrl)}`
    : "/post-login";
  const initialState: LoginActionState = { status: "idle" };
  const [state, formAction, isLoading] = useActionState(login, initialState);
  const error =
    state.status === "failed"
      ? "Invalid email or password."
      : state.status === "invalid_data"
        ? "Enter a valid email and password."
        : null;

  useEffect(() => {
    if (state.status === "success") {
      router.replace(postLoginUrl);
      router.refresh();
    }
  }, [postLoginUrl, router, state.status]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label className="font-normal text-muted-foreground" htmlFor="email">
            Email
          </Label>
          <Input
            autoComplete="email"
            autoFocus
            className="h-10 rounded-lg border-border/50 bg-muted/50 text-sm transition-colors focus:border-foreground/20 focus:bg-muted"
            id="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
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
            name="password"
            placeholder="********"
            required
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
