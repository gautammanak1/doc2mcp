import type { Metadata } from "next";
import { FooterSection } from "@/components/landing/footer-section";
import { LandingNavigation } from "@/components/landing/navigation";
import { PricingSection } from "@/components/landing/pricing-section";

export const metadata: Metadata = {
  title: "Pricing — doc2mcp",
  description:
    "Free forever for tinkering. Starter ₹299, Pro ₹999, Team ₹2,999 per month. Razorpay checkout, INR pricing, monthly / 6-month / yearly cycles.",
};

export default function PricingPage() {
  return (
    <main className="landing-page relative min-h-screen overflow-x-hidden">
      <LandingNavigation />
      <div className="h-24" />
      <PricingSection />
      <FooterSection />
    </main>
  );
}
