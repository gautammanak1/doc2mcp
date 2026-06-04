import { desc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { Suspense } from "react";
import { SkeletonTable } from "@/components/ui/page-skeleton";
import { type BillingCurrency, formatMoney } from "@/lib/billing/plans";
import { db } from "@/lib/db/client";
import { subscription, user } from "@/lib/db/schema";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl">Payments</h2>
        <p className="text-muted-foreground text-sm">
          Razorpay orders that activated paid plans
        </p>
      </div>
      <Suspense fallback={<SkeletonTable columns={6} rows={8} />}>
        <PaymentsTable />
      </Suspense>
    </div>
  );
}

async function PaymentsTable() {
  await connection();

  const rows = await db
    .select({
      id: subscription.id,
      plan: subscription.plan,
      billingCycle: subscription.billingCycle,
      status: subscription.status,
      amount: subscription.amount,
      currency: subscription.currency,
      orderId: subscription.razorpayOrderId,
      paymentId: subscription.razorpayPaymentId,
      createdAt: subscription.createdAt,
      currentPeriodEnd: subscription.currentPeriodEnd,
      email: user.email,
    })
    .from(subscription)
    .leftJoin(user, eq(subscription.userId, user.id))
    .orderBy(desc(subscription.createdAt))
    .limit(50);

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No Razorpay payments yet. Run a checkout from /pricing to populate this
        table.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/50">
      <table className="w-full min-w-[840px] text-left text-sm">
        <thead className="border-border/50 border-b bg-muted/30 text-muted-foreground text-xs">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Renews</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3 font-mono text-xs">{row.orderId}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {row.email ?? "—"}
              </td>
              <td className="px-4 py-3 capitalize">
                {row.plan} · {row.billingCycle}
              </td>
              <td className="px-4 py-3">
                {row.currency === "INR" || row.currency === "USD"
                  ? formatMoney(row.amount, row.currency as BillingCurrency)
                  : `${(row.amount / 100).toFixed(2)} ${row.currency}`}
              </td>
              <td className="px-4 py-3 capitalize">{row.status}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {row.currentPeriodEnd
                  ? new Date(row.currentPeriodEnd).toLocaleDateString()
                  : "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(row.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
