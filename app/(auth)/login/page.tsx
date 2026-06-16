import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { LoginForm } from "@/components/auth/login-form";
import { isAdminEmail } from "@/lib/admin/admin-access";

function LoginHeading() {
  return (
    <>
      <h1 className="font-semibold text-2xl tracking-tight">Welcome back</h1>
      <p className="text-muted-foreground text-sm">
        Sign in to your account to continue
      </p>
    </>
  );
}

function LoginFormSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
      <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
      <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
      <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
    </div>
  );
}

async function LoginPageContent({
  searchParams,
}: {
  searchParams: Promise<{ redirectUrl?: string }>;
}) {
  await connection();
  const { redirectUrl } = await searchParams;
  const session = await auth();

  if (session?.user?.email && session.user.type === "regular") {
    if (redirectUrl?.startsWith("/") && !redirectUrl.startsWith("//")) {
      redirect(redirectUrl);
    }
    redirect(isAdminEmail(session.user.email) ? "/admin" : "/chat");
  }

  const safeRedirect =
    redirectUrl?.startsWith("/") && !redirectUrl.startsWith("//")
      ? redirectUrl
      : null;

  return <LoginForm redirectUrl={safeRedirect} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectUrl?: string }>;
}) {
  return (
    <>
      <LoginHeading />
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginPageContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
