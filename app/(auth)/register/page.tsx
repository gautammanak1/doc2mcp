"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { useSupabaseAuth } from "@/lib/supabase/auth";

export default function Page() {
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
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="text-sm text-muted-foreground">Get started for free</p>
      <SignUpForm />
    </>
  );
}
