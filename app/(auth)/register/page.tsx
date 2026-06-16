import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectUrl?: string }>;
}) {
  await connection();
  const { redirectUrl } = await searchParams;

  if (redirectUrl?.startsWith("/") && !redirectUrl.startsWith("//")) {
    redirect(`/login?redirectUrl=${encodeURIComponent(redirectUrl)}`);
  }

  redirect("/login");
}
