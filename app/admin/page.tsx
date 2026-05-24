import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { CONTACT_EMAIL } from "@/lib/config/site";
import { getAdminStats, getAllProjects } from "@/lib/db/queries";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

function AdminFallback() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm">Loading admin control center…</p>
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
      initialStats={stats}
      initialProjects={projects}
      adminEmail={adminEmail}
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
