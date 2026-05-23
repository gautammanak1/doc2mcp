import type { NextAuthConfig } from "next-auth";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const appUrl = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;

export const authConfig = {
  basePath: "/api/auth",
  trustHost: true,
  ...(appUrl ? { baseURL: appUrl } : {}),
  pages: {
    signIn: `${base}/login`,
    newUser: `${base}/`,
  },
  providers: [],
  callbacks: {},
} satisfies NextAuthConfig;
