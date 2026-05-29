"use client";

import { useEffect, useState } from "react";
import {
  type BillingCurrency,
  DEFAULT_CURRENCY,
  isBillingCurrency,
} from "@/lib/billing/plans";

const STORAGE_KEY = "doc2mcp.billing.currency";
const COOKIE_NAME = "d2m_currency";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) {
    return null;
  }
  return decodeURIComponent(match.split("=")[1] ?? "");
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") {
    return;
  }
  const oneYear = 60 * 60 * 24 * 365;
  const serialized = `${name}=${encodeURIComponent(value)}; path=/; max-age=${oneYear}; samesite=lax`;
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not supported in Safari yet
  document.cookie = serialized;
}

/**
 * Detect the right currency without any external call:
 *
 *   1. User preference saved in localStorage (manual toggle wins).
 *   2. Currency cookie set by the geo middleware (server-side hint).
 *   3. Intl timezone — Asia/Kolkata → INR, everything else → USD.
 *   4. Fallback to DEFAULT_CURRENCY (USD).
 */
function detectCurrency(): BillingCurrency {
  if (typeof window === "undefined") {
    return DEFAULT_CURRENCY;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && isBillingCurrency(stored)) {
      return stored;
    }
  } catch {
    // localStorage may be blocked in private mode — ignore.
  }

  const fromCookie = readCookie(COOKIE_NAME);
  if (fromCookie && isBillingCurrency(fromCookie)) {
    return fromCookie;
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") {
      return "INR";
    }
  } catch {
    // ignore
  }

  return DEFAULT_CURRENCY;
}

/**
 * React hook that returns the active billing currency and a setter that
 * persists it across reloads. On first render it returns DEFAULT_CURRENCY
 * (so server + client agree) and upgrades after mount.
 */
export function useBillingCurrency() {
  const [currency, setCurrencyState] =
    useState<BillingCurrency>(DEFAULT_CURRENCY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCurrencyState(detectCurrency());
    setReady(true);
  }, []);

  const setCurrency = (next: BillingCurrency) => {
    setCurrencyState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    writeCookie(COOKIE_NAME, next);
  };

  return { currency, setCurrency, ready };
}
