"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { useSupabaseAuth } from "@/lib/supabase/auth";

function LoginContent() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="text-sm text-muted-foreground">
        Sign in to your account to continue
      </p>
      <LoginForm />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
      <LoginContent />
    </Suspense>
  );
}
