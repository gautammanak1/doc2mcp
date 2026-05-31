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
  "/blog",
  "/contact",
  "/privacy-policy",
  "/refund-policy",
  "/terms-and-conditions",
  "/api/auth",
  "/api/contact",
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

/**
 * Apply baseline security headers to every response. Cheap insurance that
 * blocks clickjacking, mime sniffing, and unnecessary referrer leakage.
 */
function applySecurityHeaders(response: NextResponse) {
  const headers = response.headers;
  if (!headers.has("X-Content-Type-Options")) {
    headers.set("X-Content-Type-Options", "nosniff");
  }
  if (!headers.has("X-Frame-Options")) {
    headers.set("X-Frame-Options", "DENY");
  }
  if (!headers.has("Referrer-Policy")) {
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }
  if (!headers.has("Permissions-Policy")) {
    headers.set(
      "Permissions-Policy",
      'camera=(), microphone=(), geolocation=(), payment=(self "https://api.razorpay.com")'
    );
  }
  if (
    process.env.NODE_ENV === "production" &&
    !headers.has("Strict-Transport-Security")
  ) {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  // Strip framework fingerprints. They give attackers free recon.
  headers.delete("X-Powered-By");
  headers.delete("Server");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next({ request });
  }

  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  // Hot path: MCP tool calls authenticate via bearer token inside the route
  // handler (resolveMcpProject → verifyMcpToken). Running Supabase session
  // refresh here adds 150-400ms per call for zero benefit, since the MCP
  // bearer token is the source of truth. Skip middleware entirely.
  if (pathname.startsWith("/api/mcp/")) {
    const response = NextResponse.next({ request });
    applySecurityHeaders(response);
    return response;
  }

  const { supabaseResponse, user } = await updateSession(request);
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  setCurrencyHintIfMissing(request, supabaseResponse);
  applySecurityHeaders(supabaseResponse);

  if (isPublicPath(pathname)) {
    if (user && AUTH_PAGES.includes(pathname)) {
      const redirect = NextResponse.redirect(new URL(`${base}/`, request.url));
      applySecurityHeaders(redirect);
      return redirect;
    }

    return supabaseResponse;
  }

  if (pathname.startsWith("/admin") && (!user || !isAdminEmail(user.email))) {
    const redirect = NextResponse.redirect(
      new URL(`${base}/login`, request.url)
    );
    applySecurityHeaders(redirect);
    return redirect;
  }

  if (pathname.startsWith("/dashboard") && !user) {
    const redirectUrl = new URL(`${base}/login`, request.url);
    redirectUrl.searchParams.set("redirectUrl", pathname);
    const redirect = NextResponse.redirect(redirectUrl);
    applySecurityHeaders(redirect);
    return redirect;
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
    "/blog",
    "/blog/:path*",
    "/contact",
    "/privacy-policy",
    "/refund-policy",
    "/terms-and-conditions",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|woff2?|ttf|eot)$).*)",
  ],
};
