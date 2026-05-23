"use client";

import { useGuestSession } from "@/hooks/use-guest-session";

export default function ChatPage() {
  useGuestSession("/chat");
  return null;
}
