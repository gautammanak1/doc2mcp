import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import {
  DEFAULT_CURRENCY,
  getPeriodWindow,
  getPlanPrice,
  isBillingCycle,
  isPlanId,
} from "@/lib/billing/plans";
import { upsertSubscriptionFromRazorpay } from "@/lib/db/queries";
import { getRazorpay } from "@/lib/razorpay/client";
import { verifyRazorpaySignature } from "@/lib/razorpay/signature";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  plan: z.string().min(1),
  cycle: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return Response.json(
      { error: "Missing or invalid payment fields" },
      { status: 400 }
    );
  }

  if (!(isPlanId(body.plan) && isBillingCycle(body.cycle))) {
    return Response.json(
      { error: "Invalid plan or billing cycle" },
      { status: 400 }
    );
  }

  const signatureOk = verifyRazorpaySignature({
    orderId: body.razorpay_order_id,
    paymentId: body.razorpay_payment_id,
    signature: body.razorpay_signature,
  });

  if (!signatureOk) {
    return Response.json(
      { error: "Signature verification failed" },
      { status: 400 }
    );
  }

  // Defense-in-depth: re-fetch BOTH the order and the payment from Razorpay.
  //
  // The HMAC signature alone is insufficient because Razorpay produces a
  // valid signature for `authorized` payments that have NOT been captured —
  // and for payments that were later refunded. An attacker can authorize a
  // payment, abort capture, and POST the legitimate signature triplet here
  // to flip their plan to "active" for free.
  //
  // We therefore re-fetch the payment, confirm:
  //   - payment.status === "captured" (actual money moved)
  //   - payment.order_id matches the order id we received
  //   - payment.amount matches the order.amount (no price tampering)
  //   - payment.currency matches the order.currency
  let orderNotesUserId: string | null = null;
  let orderAmount: number = getPlanPrice(
    body.plan,
    DEFAULT_CURRENCY,
    body.cycle
  );
  let orderCurrency: string = DEFAULT_CURRENCY;
  try {
    const razorpay = getRazorpay();
    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(body.razorpay_order_id),
      razorpay.payments.fetch(body.razorpay_payment_id),
    ]);
    orderNotesUserId = (order.notes?.userId as string | undefined) ?? null;
    orderAmount =
      typeof order.amount === "number" ? order.amount : Number(order.amount);
    orderCurrency = order.currency ?? DEFAULT_CURRENCY;

    if (payment.status !== "captured") {
      return Response.json(
        {
          error:
            "Payment is not captured. If the charge succeeded, please contact support.",
        },
        { status: 402 }
      );
    }

    if (payment.order_id !== body.razorpay_order_id) {
      return Response.json(
        { error: "Payment does not belong to this order" },
        { status: 400 }
      );
    }

    const paymentAmount =
      typeof payment.amount === "number"
        ? payment.amount
        : Number(payment.amount);
    if (paymentAmount !== orderAmount) {
      return Response.json(
        { error: "Payment amount does not match order amount" },
        { status: 400 }
      );
    }

    if (payment.currency !== orderCurrency) {
      return Response.json(
        { error: "Payment currency does not match order currency" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Razorpay order/payment fetch failed during verify:", error);
    return Response.json(
      { error: "Could not verify order with Razorpay" },
      { status: 500 }
    );
  }

  if (orderNotesUserId && orderNotesUserId !== session.user.id) {
    return Response.json(
      { error: "Order does not belong to this user" },
      { status: 403 }
    );
  }

  const period = getPeriodWindow(body.cycle);

  try {
    await upsertSubscriptionFromRazorpay({
      userId: session.user.id,
      plan: body.plan,
      billingCycle: body.cycle,
      status: "active",
      razorpayOrderId: body.razorpay_order_id,
      razorpayPaymentId: body.razorpay_payment_id,
      razorpayCustomerId: null,
      amount: orderAmount,
      currency: orderCurrency,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      cancelAtPeriodEnd: true, // one-time order — user has to renew manually
    });
  } catch (error) {
    console.error("Razorpay verify upsert error:", error);
    return Response.json(
      {
        error:
          "Payment verified, but we could not activate your plan. Contact support.",
      },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    plan: body.plan,
    cycle: body.cycle,
    currentPeriodEnd: period.end.toISOString(),
  });
}
