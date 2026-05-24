import { UsersTable } from "@/components/admin/users-table";
import { getAllUsersWithStats } from "@/lib/db/queries";

export default async function AdminUsersPage() {
  const users = await getAllUsersWithStats(200);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl">Users</h2>
        <p className="text-muted-foreground text-sm">
          Disable bans Supabase login and cancels Stripe subscription
        </p>
      </div>
      <UsersTable
        rows={users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          disabled: u.disabled,
          plan: u.plan,
          subscriptionStatus: u.subscriptionStatus,
          periodEnd: u.periodEnd?.toISOString() ?? null,
          projectCount: u.projectCount,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
