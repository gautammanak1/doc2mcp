"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex min-h-dvh w-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border/40 p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">
          {error ?? "An unspecified authentication error occurred."}
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={<p className="p-8 text-muted-foreground">Loading...</p>}
    >
      <ErrorContent />
    </Suspense>
  );
}
