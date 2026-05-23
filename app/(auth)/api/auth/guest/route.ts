import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";
import { createGuestUser } from "@/lib/db/queries";
import { isDevelopmentEnvironment } from "@/lib/constants";

function sessionCookieName(): string {
  return isDevelopmentEnvironment
    ? "authjs.session-token"
    : "__Secure-authjs.session-token";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawRedirect = searchParams.get("redirectUrl") || "/";
  const redirectUrl =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/";

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "AUTH_SECRET is not configured" },
      { status: 500 }
    );
  }

  const token = await getToken({
    req: request,
    secret,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (token) {
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  const [guestUser] = await createGuestUser();
  const cookieName = sessionCookieName();
  const sessionToken = await encode({
    token: {
      sub: guestUser.id,
      id: guestUser.id,
      email: guestUser.email,
      type: "guest",
    },
    secret,
    salt: cookieName,
    maxAge: 30 * 24 * 60 * 60,
  });

  const response = NextResponse.redirect(new URL(redirectUrl, request.url));
  response.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    secure: !isDevelopmentEnvironment,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
