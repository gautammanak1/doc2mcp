import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { auth } from "@/app/(auth)/auth";
import { getStripe } from "@/lib/billing/stripe";
import { SITE_URL } from "@/lib/config/site";
import { getPostgresClient } from "@/lib/db/client";
import { user } from "@/lib/db/schema";

const db = drizzle(getPostgresClient());

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [dbUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!dbUser?.stripeCustomerId) {
      return Response.json(
        { error: "No billing account found. Subscribe to a plan first." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${baseUrl}/pricing`,
    });

    return Response.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return Response.json({ error: "Portal failed" }, { status: 500 });
  }
}
