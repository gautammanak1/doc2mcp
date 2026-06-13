import type { Metadata } from "next";
import { connection } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { AuthAwareLandingNavigation } from "@/components/landing/auth-aware-navigation";
import { FooterSection } from "@/components/landing/footer-section";
import { PricingSection } from "@/components/landing/pricing-section";

export const metadata: Metadata = {
  title: "Pricing — doc2mcp",
  description:
    "Free forever for tinkering. Starter ₹299, Pro ₹999, Team ₹2,999 per month. Razorpay checkout, INR pricing, monthly / 6-month / yearly cycles.",
};

export default async function PricingPage() {
  await connection();
  const session = await auth();
  const initiallyAuthenticated =
    !!session?.user?.id && session.user.type !== "guest";

  return (
    <main className="landing-page relative min-h-screen overflow-x-hidden">
      <AuthAwareLandingNavigation />
      <div className="h-24" />
      <PricingSection
        detailed
        initiallyAuthenticated={initiallyAuthenticated}
      />
      <FooterSection />
    </main>
  );
}
