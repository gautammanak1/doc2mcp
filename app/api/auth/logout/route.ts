import { NextResponse } from "next/server";
import {
  APP_SESSION_COOKIE,
  clearAppSessionCookieOptions,
} from "@/lib/auth/app-session";

export function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(APP_SESSION_COOKIE, "", clearAppSessionCookieOptions());

  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieNames = cookieHeader
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter((name) => name.startsWith("sb-"));

  for (const name of cookieNames) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
  }

  return response;
}
