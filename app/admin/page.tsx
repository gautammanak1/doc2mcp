import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

function AdminFallback() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm">Loading admin…</p>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminDashboard />
    </Suspense>
  );
}
