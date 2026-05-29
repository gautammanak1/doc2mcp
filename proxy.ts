import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/auth",
  "/post-login",
  "/pricing",
  "/demo",
  "/api/auth",
  "/ping",
  "/chat",
  "/docs",
  "/api/mcp",
];

const AUTH_PAGES = ["/login", "/register"];

function splitEmails(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const configured = [
    ...splitEmails(process.env.ADMIN_EMAILS),
    ...splitEmails(process.env.ADMIN_EMAIL),
    ...splitEmails(process.env.NEXT_PUBLIC_ADMIN_EMAIL),
  ];
  const adminEmails =
    configured.length > 0 ? configured : ["doc2mcp@gmail.com"];

  return adminEmails.includes(email.toLowerCase());
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    /\.(?:png|jpe?g|gif|webp|svg|ico|txt|xml|woff2?|ttf|eot|mp4|webm)$/i.test(
      pathname
    )
  );
}

const CURRENCY_COOKIE = "d2m_currency";

/**
 * Set a `d2m_currency` cookie based on the geo header Vercel/Cloudflare set
 * on the request, so the pricing UI can render server-correct prices on the
 * very first paint. Skipped when the user has already picked a currency.
 */
function setCurrencyHintIfMissing(
  request: NextRequest,
  response: NextResponse
) {
  if (request.cookies.get(CURRENCY_COOKIE)) {
    return;
  }
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    "";
  const currency = country.toUpperCase() === "IN" ? "INR" : "USD";
  response.cookies.set(CURRENCY_COOKIE, currency, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next({ request });
  }

  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  const { supabaseResponse, user } = await updateSession(request);
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  setCurrencyHintIfMissing(request, supabaseResponse);

  if (isPublicPath(pathname)) {
    if (user && AUTH_PAGES.includes(pathname)) {
      return NextResponse.redirect(new URL(`${base}/`, request.url));
    }

    return supabaseResponse;
  }

  if (pathname.startsWith("/admin") && (!user || !isAdminEmail(user.email))) {
    return NextResponse.redirect(new URL(`${base}/login`, request.url));
  }

  if (pathname.startsWith("/dashboard") && !user) {
    const redirectUrl = new URL(`${base}/login`, request.url);
    redirectUrl.searchParams.set("redirectUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/convert/:path*",
    "/api/:path*",
    "/login",
    "/register",
    "/auth/:path*",
    "/pricing",
    "/demo",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|woff2?|ttf|eot)$).*)",
  ],
};
