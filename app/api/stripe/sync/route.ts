import { auth } from "@/app/(auth)/auth";
import { syncSubscriptionsForCustomer } from "@/lib/billing/sync";
import { getUserById } from "@/lib/db/queries";

/**
 * Manual recovery endpoint. Pulls all Stripe subscriptions for the signed-in
 * user's Stripe customer record and mirrors them into our DB. Safe to call
 * any time — idempotent on stripeSubscriptionId.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await getUserById(session.user.id);
    if (!dbUser?.stripeCustomerId) {
      return Response.json(
        {
          ok: false,
          synced: 0,
          planId: "free",
          reason: "no_stripe_customer",
          message:
            "We don't have a Stripe customer on file for your account yet. Start a checkout from /pricing first.",
        },
        { status: 200 }
      );
    }

    const result = await syncSubscriptionsForCustomer(dbUser.stripeCustomerId);
    return Response.json(result);
  } catch (error) {
    console.error("Stripe sync error:", error);
    return Response.json(
      { error: "Sync failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
