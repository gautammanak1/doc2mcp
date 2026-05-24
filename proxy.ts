import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { guestRegex } from "./lib/constants";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/pricing",
  "/demo",
  "/api/auth",
  "/ping",
  "/chat",
  "/docs",
  "/api/mcp",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
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
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: {
          name: string;
          value: string;
          options: CookieOptions;
        }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return supabaseResponse;
  }

  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  if (isPublicPath(pathname)) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user || user.email !== (process.env.ADMIN_EMAIL ?? "doc2mcp@gmail.com")) {
      return NextResponse.redirect(new URL(`${base}/login`, request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && ["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL(`${base}/`, request.url));
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
    "/pricing",
    "/demo",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|woff2?|ttf|eot)$).*)",
  ],
};
