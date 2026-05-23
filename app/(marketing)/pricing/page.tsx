import type { Metadata } from "next";
import { FooterSection } from "@/components/landing/footer-section";
import { LandingNavigation } from "@/components/landing/navigation";
import { PricingSection } from "@/components/landing/pricing-section";

export const metadata: Metadata = {
  title: "Pricing — doc2mcp",
  description:
    "Simple plans for turning docs into MCPs. Starter $5, Pro $20, Team $50. Monthly, 6-month, or yearly billing.",
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
