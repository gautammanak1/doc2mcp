import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { isAdminEmail } from "@/lib/admin/admin-access";

function RegisterHeading() {
  return (
    <>
      <h1 className="font-semibold text-2xl tracking-tight">Create account</h1>
      <p className="text-muted-foreground text-sm">Get started for free</p>
    </>
  );
}

function RegisterFormSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
      <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
      <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
      <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
    </div>
  );
}

async function RegisterPageContent() {
  await connection();
  const session = await auth();

  if (session?.user?.email && session.user.type === "regular") {
    redirect(isAdminEmail(session.user.email) ? "/admin" : "/chat");
  }

  return <SignUpForm />;
}

export default function RegisterPage() {
  return (
    <>
      <RegisterHeading />
      <Suspense fallback={<RegisterFormSkeleton />}>
        <RegisterPageContent />
      </Suspense>
    </>
  );
}
