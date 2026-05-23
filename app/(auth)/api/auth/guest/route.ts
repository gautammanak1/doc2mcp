import { NextResponse } from "next/server";
import { encode, getToken } from "next-auth/jwt";
import { isDevelopmentEnvironment } from "@/lib/constants";
import { ChatbotError } from "@/lib/errors";
import { createGuestUser } from "@/lib/db/queries";

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
    console.error("Guest auth failed: AUTH_SECRET is not configured");
    return NextResponse.json(
      { error: "AUTH_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (!process.env.POSTGRES_URL) {
    console.error("Guest auth failed: POSTGRES_URL is not configured");
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 500 }
    );
  }

  try {
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
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    if (error instanceof ChatbotError) {
      console.error("Guest auth database error:", error.cause ?? error.message);
      return error.toResponse();
    }

    console.error("Guest auth failed:", error);
    return NextResponse.json(
      { error: "Failed to create guest session" },
      { status: 500 }
    );
  }
}
