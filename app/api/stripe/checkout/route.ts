import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import {
  getStripeRecurring,
  isBillingCycle,
  isPlanId,
  PLANS,
} from "@/lib/billing/plans";
import { getStripe } from "@/lib/billing/stripe";
import { SITE_URL } from "@/lib/config/site";
import { getUserById, setUserStripeCustomerId } from "@/lib/db/queries";

const bodySchema = z.object({
  plan: z.string(),
  cycle: z.string(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await request.json());
    if (!isPlanId(body.plan) || !isBillingCycle(body.cycle)) {
      return Response.json(
        { error: "Invalid plan or billing cycle" },
        { status: 400 }
      );
    }

    const planConfig = PLANS[body.plan];
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL;

    const dbUser = await getUserById(session.user.id);
    let customerId = dbUser?.stripeCustomerId ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      await setUserStripeCustomerId(session.user.id, customerId);
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `doc2mcp ${planConfig.name} (${body.cycle})`,
            },
            unit_amount: planConfig.prices[body.cycle],
            recurring: getStripeRecurring(body.cycle),
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=canceled`,
      metadata: {
        userId: session.user.id,
        plan: body.plan,
        cycle: body.cycle,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan: body.plan,
          cycle: body.cycle,
        },
      },
    });

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json({ error: "Checkout failed" }, { status: 500 });
  }
}
