import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  APP_SESSION_COOKIE,
  clearAppSessionCookieOptions,
  clearSupabaseAuthCookiesOnResponse,
} from "@/lib/auth/app-session";
import { isSupabasePublicConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function redirectWithClearedAuth(request: NextRequest, url: string) {
  const response = NextResponse.redirect(url);
  response.cookies.set(APP_SESSION_COOKIE, "", clearAppSessionCookieOptions());
  clearSupabaseAuthCookiesOnResponse(request, response);
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    if (!isSupabasePublicConfigured()) {
      return redirectWithClearedAuth(request, `${origin}/auth/error`);
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return redirectWithClearedAuth(request, `${origin}/auth/error`);
}
