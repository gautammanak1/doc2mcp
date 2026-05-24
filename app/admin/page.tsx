import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { CONTACT_EMAIL } from "@/lib/config/site";
import { getAdminStats, getAllProjects } from "@/lib/db/queries";

function AdminFallback() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm">
        Loading admin control center…
      </p>
    </main>
  );
}

async function AdminLoader() {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL ?? CONTACT_EMAIL;

  if (!session?.user?.email || session.user.email !== adminEmail) {
    redirect("/login");
  }

  const [stats, projects] = await Promise.all([
    getAdminStats(),
    getAllProjects(100),
  ]);

  return (
    <AdminDashboard
      initialProjects={projects}
      initialStats={stats}
      userEmail={session.user.email}
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminLoader />
    </Suspense>
  );
}
