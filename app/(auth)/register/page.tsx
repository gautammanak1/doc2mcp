import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { isAdminEmail } from "@/lib/admin/admin-access";

export default async function RegisterPage() {
  await connection();
  const session = await auth();

  if (session?.user?.email) {
    redirect(isAdminEmail(session.user.email) ? "/admin" : "/chat");
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="text-sm text-muted-foreground">Get started for free</p>
      <SignUpForm />
    </>
  );
}
