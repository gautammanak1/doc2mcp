-- Grant enterprise plan to founder account (idempotent).
INSERT INTO "Subscription" (
  "userId",
  "plan",
  "billingCycle",
  "status",
  "razorpayCustomerId",
  "razorpayOrderId",
  "razorpayPaymentId",
  "amount",
  "currency",
  "currentPeriodStart",
  "currentPeriodEnd",
  "cancelAtPeriodEnd",
  "createdAt",
  "updatedAt"
)
SELECT
  u.id,
  'enterprise',
  'yearly',
  'active',
  'founder-enterprise',
  'founder-enterprise-order',
  'founder-enterprise-payment',
  0,
  'INR',
  now(),
  now() + interval '10 years',
  false,
  now(),
  now()
FROM "User" u
WHERE lower(u.email) = 'gautammanak1@gmail.com'
  AND NOT EXISTS (
    SELECT 1
    FROM "Subscription" s
    WHERE s."userId" = u.id
      AND s.status IN ('active', 'trialing', 'past_due')
  );

UPDATE "Subscription" s
SET
  "plan" = 'enterprise',
  "status" = 'active',
  "billingCycle" = 'yearly',
  "currentPeriodStart" = now(),
  "currentPeriodEnd" = now() + interval '10 years',
  "updatedAt" = now()
FROM "User" u
WHERE s."userId" = u.id
  AND lower(u.email) = 'gautammanak1@gmail.com'
  AND s.status IN ('active', 'trialing', 'past_due');

UPDATE "User"
SET "disabled" = false
WHERE lower(email) = 'gautammanak1@gmail.com';
