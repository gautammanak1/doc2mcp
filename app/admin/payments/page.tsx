import { connection } from "next/server";
import { Suspense } from "react";
import { SkeletonTable } from "@/components/ui/page-skeleton";
import { getStripe, isStripeConfigured } from "@/lib/billing/stripe";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl">Payments</h2>
        <p className="text-muted-foreground text-sm">
          Recent paid invoices from Stripe
        </p>
      </div>
      <Suspense fallback={<SkeletonTable columns={5} rows={8} />}>
        <InvoicesTable />
      </Suspense>
    </div>
  );
}

async function InvoicesTable() {
  await connection();

  if (!isStripeConfigured()) {
    return (
      <p className="text-muted-foreground text-sm">
        Stripe is not configured. Add STRIPE_SECRET_KEY to view payments.
      </p>
    );
  }

  const stripe = getStripe();
  const invoices = await stripe.invoices.list({ limit: 50 });

  return (
    <div className="overflow-x-auto rounded-xl border border-border/50">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-border/50 border-b bg-muted/30 text-muted-foreground text-xs">
          <tr>
            <th className="px-4 py-3">Invoice</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {invoices.data.map((inv) => (
            <tr key={inv.id}>
              <td className="px-4 py-3 font-mono text-xs">
                {inv.number ?? inv.id}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {inv.customer_email ?? inv.customer?.toString() ?? "—"}
              </td>
              <td className="px-4 py-3">
                ${((inv.amount_paid ?? 0) / 100).toFixed(2)}{" "}
                {inv.currency?.toUpperCase()}
              </td>
              <td className="px-4 py-3 capitalize">{inv.status}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {inv.status_transitions.paid_at
                  ? new Date(
                      inv.status_transitions.paid_at * 1000
                    ).toLocaleString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
