"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState } from "react";
import { type RegisterActionState, register } from "@/app/(auth)/actions";
import { LoaderIcon } from "@/components/chat/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

function getSignUpErrorMessage(error: unknown) {
  if (error === "user_exists") {
    return "An account already exists for this email. Please sign in instead.";
  }

  if (error === "invalid_data") {
    return "Enter a valid email and a password with at least 6 characters.";
  }

  return "We could not create your account. Please try again.";
}

export function SignUpForm({ className }: { className?: string }) {
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const initialState: RegisterActionState = { status: "idle" };
  const [state, formAction, isLoading] = useActionState(register, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.replace("/post-login");
      router.refresh();
      return;
    }

    if (state.status !== "idle" && state.status !== "in_progress") {
      setError(getSignUpErrorMessage(state.status));
    }
  }, [router, state.status]);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    const password = String(formData.get("password") ?? "");
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <form action={handleSubmit} className="flex flex-col gap-4">
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
