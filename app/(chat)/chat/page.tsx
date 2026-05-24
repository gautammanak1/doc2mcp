"use client";

import { useGuestSession } from "@/hooks/use-guest-session";

function ChatLoadingShimmer() {
  return (
    <div
      className="flex h-dvh w-full items-center justify-center"
      role="status"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-pulse rounded-full bg-muted" />
        <p className="text-muted-foreground text-sm">Loading chat…</p>
      </div>
    </div>
  );
}

export default function Page() {
  const { user, loading } = useGuestSession("/chat");

  if (loading || !user) {
    return <ChatLoadingShimmer />;
  }

  return null;
}
