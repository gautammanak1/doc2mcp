import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { LoginForm } from "@/components/auth/login-form";
import { isAdminEmail } from "@/lib/admin/admin-access";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectUrl?: string }>;
}) {
  await connection();
  const { redirectUrl } = await searchParams;
  const session = await auth();

  if (session?.user?.email) {
    if (redirectUrl?.startsWith("/") && !redirectUrl.startsWith("//")) {
      redirect(redirectUrl);
    }
    redirect(isAdminEmail(session.user.email) ? "/admin" : "/chat");
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="text-sm text-muted-foreground">
        Sign in to your account to continue
      </p>
      <LoginForm />
    </>
  );
}
