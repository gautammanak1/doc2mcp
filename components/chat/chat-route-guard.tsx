"use client";

import { useGuestSession } from "@/hooks/use-guest-session";

function ChatLoadingShimmer() {
  return (
    <output className="flex h-dvh w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-pulse rounded-full bg-muted" />
        <p className="text-muted-foreground text-sm">Loading chat…</p>
      </div>
    </output>
  );
}

export function ChatRouteGuard({ redirectUrl }: { redirectUrl: string }) {
  const { user, loading } = useGuestSession(redirectUrl);

  if (loading || !user) {
    return <ChatLoadingShimmer />;
  }

  return null;
}
