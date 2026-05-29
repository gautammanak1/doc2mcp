import { nanoid } from "nanoid";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import {
  BILLING_CURRENCY,
  isBillingCycle,
  isPlanId,
  PLANS,
} from "@/lib/billing/plans";
import { getRazorpay, getRazorpayKeyId } from "@/lib/razorpay/client";

const MIN_AMOUNT_PAISE = 100;

const bodySchema = z.object({
  plan: z.string(),
  cycle: z.string(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.type === "guest") {
    return Response.json(
      { error: "Sign in to purchase a plan." },
      { status: 401 }
    );
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!(isPlanId(parsed.plan) && isBillingCycle(parsed.cycle))) {
    return Response.json(
      { error: "Invalid plan or billing cycle" },
      { status: 400 }
    );
  }

  const planConfig = PLANS[parsed.plan];
  const amount = planConfig.prices[parsed.cycle];

  if (amount < MIN_AMOUNT_PAISE) {
    return Response.json(
      { error: "Plan amount is below Razorpay's minimum of 100 paise." },
      { status: 400 }
    );
  }

  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount,
      currency: BILLING_CURRENCY,
      // Razorpay's `receipt` field is capped at 40 chars.
      receipt: `d2m_${parsed.plan.slice(0, 4)}_${nanoid(10)}`.slice(0, 40),
      notes: {
        userId: session.user.id,
        email: session.user.email ?? "",
        plan: parsed.plan,
        cycle: parsed.cycle,
      },
    });

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      plan: parsed.plan,
      cycle: parsed.cycle,
      planName: planConfig.name,
      userEmail: session.user.email ?? null,
      userName: session.user.name ?? null,
    });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    return Response.json(
      { error: "Could not create payment order. Please try again." },
      { status: 500 }
    );
  }
}
