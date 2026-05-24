import "server-only";

import { auth } from "@/app/(auth)/auth";
import { CONTACT_EMAIL } from "@/lib/config/site";

export async function requireAdmin() {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL ?? CONTACT_EMAIL;

  if (!session?.user?.email || session.user.email !== adminEmail) {
    return null;
  }

  return session;
}
