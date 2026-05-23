import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = [
  "gautammanak1@gmail.com",
  process.env.ADMIN_EMAIL,
].filter(Boolean);

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/login");
  }

  return session;
}

export async function isAdmin(email?: string): Promise<boolean> {
  if (!email) {
    const session = await auth();
    email = session?.user?.email;
  }

  return email ? ADMIN_EMAILS.includes(email) : false;
}
