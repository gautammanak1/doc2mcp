import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/auth",
  "/pricing",
  "/demo",
  "/api/auth",
  "/ping",
  "/chat",
  "/docs",
  "/api/mcp",
];

const AUTH_PAGES = ["/login", "/register"];

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

  if (isPublicPath(pathname)) {
    if (user && AUTH_PAGES.includes(pathname)) {
      return NextResponse.redirect(new URL(`${base}/`, request.url));
    }

    return supabaseResponse;
  }

  if (
    pathname.startsWith("/admin") &&
    (!user || user.email !== (process.env.ADMIN_EMAIL ?? "doc2mcp@gmail.com"))
  ) {
    return NextResponse.redirect(new URL(`${base}/login`, request.url));
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
