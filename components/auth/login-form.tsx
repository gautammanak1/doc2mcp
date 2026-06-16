"use client";

import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  redirectUrl,
}: {
  className?: string;
  redirectUrl?: string | null;
}) {
  return (
    <GoogleAuthButton
      className={cn(className)}
      label="Sign up with Google"
      redirectUrl={redirectUrl}
    />
  );
}
