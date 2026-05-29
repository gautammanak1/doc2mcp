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

  // Defense-in-depth: re-fetch the order from Razorpay and confirm it belongs
  // to this signed-in user (matches notes.userId set at create-order time).
  let orderNotesUserId: string | null = null;
  let orderAmount: number = getPlanPrice(
    body.plan,
    DEFAULT_CURRENCY,
    body.cycle
  );
  let orderCurrency: string = DEFAULT_CURRENCY;
  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.fetch(body.razorpay_order_id);
    orderNotesUserId = (order.notes?.userId as string | undefined) ?? null;
    orderAmount =
      typeof order.amount === "number" ? order.amount : Number(order.amount);
    orderCurrency = order.currency ?? DEFAULT_CURRENCY;
  } catch (error) {
    console.error("Razorpay order fetch failed during verify:", error);
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
