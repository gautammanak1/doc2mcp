import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { isAdminEmail } from "@/lib/admin/admin-access";

/**
 * Server-side post-login router. The login / register forms send users here
 * after a successful Supabase sign-in. We decide the destination based on
 * verified server-side identity (not on a client-side guess), so admins
 * land on /admin and regular users on /chat immediately.
 *
 * Query params:
 *   redirectUrl — explicit target (used by routes that need users back at
 *                 a specific page after auth). Honored only when it points
 *                 to an internal path.
 */
export default async function PostLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectUrl?: string }>;
}) {
  await connection();
  const { redirectUrl } = await searchParams;

  if (redirectUrl?.startsWith("/") && !redirectUrl.startsWith("//")) {
    redirect(redirectUrl);
  }

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (isAdminEmail(session.user.email)) {
    redirect("/admin");
  }

  redirect("/chat");
}
