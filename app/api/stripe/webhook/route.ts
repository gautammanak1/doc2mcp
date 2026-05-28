import type Stripe from "stripe";
import { getStripe } from "@/lib/billing/stripe";
import {
  markSubscriptionCanceled,
  syncStripeSubscription,
} from "@/lib/billing/sync";

/**
 * STRIPE_WEBHOOK_SECRET must be the `whsec_*` signing secret obtained from:
 *   Stripe Dashboard → Developers → Webhooks → (your endpoint) → Signing secret
 * It is NOT the webhook URL. A malformed secret silently breaks signature
 * verification for every event, so we sanity-check the shape on each request
 * and surface a clear configuration error instead of generic 400s.
 */
function isValidWebhookSecret(value: string | undefined): value is string {
  return Boolean(value?.startsWith("whsec_") && value.length > 20);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!isValidWebhookSecret(webhookSecret)) {
    const raw: string = process.env.STRIPE_WEBHOOK_SECRET ?? "";
    const preview = raw.length > 0 ? `${raw.slice(0, 8)}…` : "(empty)";
    console.error(
      "STRIPE_WEBHOOK_SECRET is missing or malformed. Expected a value starting with `whsec_` from the Stripe Dashboard. Got:",
      preview
    );
    return Response.json(
      {
        error:
          "Webhook misconfigured: STRIPE_WEBHOOK_SECRET must be a whsec_* signing secret from the Stripe Dashboard, not the endpoint URL.",
      },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session
      );
    } else if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      await syncStripeSubscription(sub, sub.metadata);
    } else if (event.type === "customer.subscription.deleted") {
      await markSubscriptionCanceled(event.data.object as Stripe.Subscription);
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return Response.json({ error: "Handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}

async function handleCheckoutCompleted(
  checkoutSession: Stripe.Checkout.Session
) {
  const subscriptionId =
    typeof checkoutSession.subscription === "string"
      ? checkoutSession.subscription
      : checkoutSession.subscription?.id;

  if (!subscriptionId) {
    return;
  }

  const sub = await getStripe().subscriptions.retrieve(subscriptionId);
  await syncStripeSubscription(sub, checkoutSession.metadata ?? undefined);
}
