import { NextResponse } from "next/server";
import {
  APP_SESSION_COOKIE,
  appSessionCookieOptions,
  createAppSessionToken,
} from "@/lib/auth/app-session";
import { createGuestUser } from "@/lib/db/queries";

export async function POST() {
  const [guest] = await createGuestUser();
  const token = await createAppSessionToken({
    userId: guest.id,
    email: guest.email,
    type: "guest",
  });
  const response = NextResponse.json({
    user: {
      id: guest.id,
      email: guest.email,
      type: "guest",
      is_anonymous: true,
    },
  });
  response.cookies.set(APP_SESSION_COOKIE, token, appSessionCookieOptions());
  return response;
}
