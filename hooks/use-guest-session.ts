"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export function useGuestSession(redirectPath = "/chat") {
  const { status } = useSession();
  const started = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated" && !started.current) {
      started.current = true;
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      window.location.href = `${base}/api/auth/guest?redirectUrl=${encodeURIComponent(redirectPath)}`;
    }
  }, [status, redirectPath]);
}
