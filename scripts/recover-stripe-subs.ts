/**
 * One-off recovery: walk every User row that has a stripeCustomerId and
 * mirror their Stripe subscriptions into the local Subscription table.
 *
 * Run with: `pnpm tsx scripts/recover-stripe-subs.ts`
 *
 * Useful when the Stripe webhook didn't reach us (missing/wrong
 * STRIPE_WEBHOOK_SECRET, local dev without `stripe listen`, etc.).
 */
import { config } from "dotenv";
import { isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import Stripe from "stripe";

config({ path: ".env.local" });

type SubStatus = "active" | "past_due" | "canceled" | "incomplete" | "trialing";

type PlanId = "starter" | "pro" | "team";
type BillingCycleId = "monthly" | "biannual" | "yearly";

function mapStatus(status: Stripe.Subscription.Status): SubStatus {
  switch (status) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "trialing":
      return "trialing";
    default:
      return "incomplete";
  }
}

function getPeriod(sub: Stripe.Subscription) {
  const raw = sub as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
    cancel_at_period_end?: boolean;
  };
  const item = sub.items?.data?.[0] as
    | (Stripe.SubscriptionItem & {
        current_period_start?: number;
        current_period_end?: number;
      })
    | undefined;
  const startEpoch = raw.current_period_start ?? item?.current_period_start;
  const endEpoch = raw.current_period_end ?? item?.current_period_end;
  return {
    start: startEpoch ? new Date(startEpoch * 1000) : null,
    end: endEpoch ? new Date(endEpoch * 1000) : null,
    cancelAtPeriodEnd: raw.cancel_at_period_end ?? false,
  };
}

const VALID_PLANS = new Set(["starter", "pro", "team"]);
const VALID_CYCLES = new Set(["monthly", "biannual", "yearly"]);

async function main() {
  const postgresUrl = process.env.POSTGRES_URL;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!postgresUrl) {
    throw new Error("POSTGRES_URL not set in .env.local");
  }
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY not set in .env.local");
  }

  const stripe = new Stripe(stripeKey);
  const sql = postgres(postgresUrl, { max: 1, prepare: false });
  const db = drizzle(sql);

  const { user, subscription } = await import("../lib/db/schema");
  const { eq } = await import("drizzle-orm");

  const users = await db
    .select({
      id: user.id,
      email: user.email,
      customerId: user.stripeCustomerId,
    })
    .from(user)
    .where(isNotNull(user.stripeCustomerId));

  console.log(`Found ${users.length} users with Stripe customers.\n`);

  let totalSynced = 0;

  for (const u of users) {
    if (!u.customerId) {
      continue;
    }

    let list: Stripe.ApiList<Stripe.Subscription>;
    try {
      list = await stripe.subscriptions.list({
        customer: u.customerId,
        status: "all",
        limit: 10,
      });
    } catch (error) {
      console.error(`  ${u.email}: stripe error`, (error as Error).message);
      continue;
    }

    if (list.data.length === 0) {
      console.log(`  ${u.email}: 0 subscriptions in Stripe`);
      continue;
    }

    for (const sub of list.data) {
      const meta = sub.metadata ?? {};
      const planMeta = meta.plan;
      const cycleMeta = meta.cycle;
      const plan: PlanId =
        planMeta && VALID_PLANS.has(planMeta)
          ? (planMeta as PlanId)
          : "starter";
      const cycle: BillingCycleId =
        cycleMeta && VALID_CYCLES.has(cycleMeta)
          ? (cycleMeta as BillingCycleId)
          : "monthly";
      const period = getPeriod(sub);

      const existing = await db
        .select()
        .from(subscription)
        .where(eq(subscription.stripeSubscriptionId, sub.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(subscription)
          .set({
            plan,
            billingCycle: cycle,
            status: mapStatus(sub.status),
            currentPeriodStart: period.start,
            currentPeriodEnd: period.end,
            cancelAtPeriodEnd: period.cancelAtPeriodEnd,
            updatedAt: new Date(),
          })
          .where(eq(subscription.id, existing[0].id));
      } else {
        await db.insert(subscription).values({
          userId: u.id,
          plan,
          billingCycle: cycle,
          status: mapStatus(sub.status),
          stripeCustomerId: u.customerId,
          stripeSubscriptionId: sub.id,
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
          cancelAtPeriodEnd: period.cancelAtPeriodEnd,
        });
      }

      totalSynced += 1;
      console.log(
        `  ${u.email}: sub=${sub.id} plan=${plan} cycle=${cycle} status=${sub.status}`
      );
    }
  }

  console.log(`\nDone. ${totalSynced} subscription(s) synced.`);
  await sql.end();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
