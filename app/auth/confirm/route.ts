import type { EmailOtpType } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  APP_SESSION_COOKIE,
  clearAppSessionCookieOptions,
  clearSupabaseAuthCookiesOnResponse,
} from "@/lib/auth/app-session";
import { isSupabasePublicConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function buildErrorUrl(params: {
  error: string;
  errorCode?: string;
  errorDescription?: string;
}) {
  const search = new URLSearchParams();
  search.set("error", params.error);
  const hash = new URLSearchParams();
  hash.set("error", params.error);
  if (params.errorCode) {
    hash.set("error_code", params.errorCode);
  }
  if (params.errorDescription) {
    hash.set("error_description", params.errorDescription);
  }
  return `/auth/error?${search.toString()}#${hash.toString()}`;
}

function safeNext(raw: string | null): string {
  if (!raw?.startsWith("/")) {
    return "/chat";
  }
  if (raw.startsWith("//") || raw.startsWith("/auth/")) {
    return "/chat";
  }
  return raw;
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

function redirectWithClearedAuth(request: NextRequest, path: string) {
  const response = redirectTo(request, path);
  response.cookies.set(APP_SESSION_COOKIE, "", clearAppSessionCookieOptions());
  clearSupabaseAuthCookiesOnResponse(request, response);
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (!isSupabasePublicConfigured()) {
    return redirectWithClearedAuth(
      request,
      buildErrorUrl({
        error: "Authentication is not configured",
        errorCode: "auth_not_configured",
        errorDescription:
          "Supabase environment variables are missing for this deployment.",
      })
    );
  }

  // Newer Supabase PKCE flow sends ?code=... instead of token_hash.
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectTo(request, next);
    }
    const message = error.message ?? "verification_failed";
    return redirectWithClearedAuth(
      request,
      buildErrorUrl({
        error: message,
        errorCode: "exchange_failed",
        errorDescription: message,
      })
    );
  }

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return redirectTo(request, next);
    }

    const message = error.message ?? "verification_failed";
    const otpCode = /expired/i.test(message)
      ? "otp_expired"
      : "verification_failed";
    return redirectWithClearedAuth(
      request,
      buildErrorUrl({
        error: message,
        errorCode: otpCode,
        errorDescription: message,
      })
    );
  }

  return redirectWithClearedAuth(
    request,
    buildErrorUrl({
      error: "Missing confirmation token",
      errorCode: "missing_token",
      errorDescription:
        "The email link did not include a confirmation token. Request a new one below.",
    })
  );
}
