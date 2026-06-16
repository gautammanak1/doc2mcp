"use client";

import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { cn } from "@/lib/utils";

export function SignUpForm({ className }: { className?: string }) {
  return (
    <GoogleAuthButton className={cn(className)} label="Continue with Google" />
  );
}
