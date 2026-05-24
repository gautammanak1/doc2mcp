import { Suspense } from "react";
import { SkeletonTable } from "@/components/ui/page-skeleton";
import { getAllSubscriptionsWithUser } from "@/lib/db/queries";

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl">Subscriptions</h2>
        <p className="text-muted-foreground text-sm">
          Plan, billing cycle, and current period dates
        </p>
      </div>
      <Suspense fallback={<SkeletonTable columns={7} rows={10} />}>
        <SubscriptionsRows />
      </Suspense>
    </div>
  );
}

async function SubscriptionsRows() {
  const rows = await getAllSubscriptionsWithUser(200);

  return (
    <div className="overflow-x-auto rounded-xl border border-border/50">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-border/50 border-b bg-muted/30 text-muted-foreground text-xs">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">Cycle</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Period start</th>
            <th className="px-4 py-3">Period end</th>
            <th className="px-4 py-3">Cancel at end</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {rows.map((r) => (
            <tr key={r.subscription.id}>
              <td className="px-4 py-3">
                <div className="font-medium">{r.userEmail}</div>
                {r.userName ? (
                  <div className="text-muted-foreground text-xs">
                    {r.userName}
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3 capitalize">{r.subscription.plan}</td>
              <td className="px-4 py-3 capitalize">
                {r.subscription.billingCycle}
              </td>
              <td className="px-4 py-3">{r.subscription.status}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {r.subscription.currentPeriodStart
                  ? new Date(
                      r.subscription.currentPeriodStart
                    ).toLocaleDateString()
                  : "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {r.subscription.currentPeriodEnd
                  ? new Date(
                      r.subscription.currentPeriodEnd
                    ).toLocaleDateString()
                  : "—"}
              </td>
              <td className="px-4 py-3">
                {r.subscription.cancelAtPeriodEnd ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
