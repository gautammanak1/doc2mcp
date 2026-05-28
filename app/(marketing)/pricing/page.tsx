import type { Metadata } from "next";
import { FooterSection } from "@/components/landing/footer-section";
import { LandingNavigation } from "@/components/landing/navigation";
import { PricingSection } from "@/components/landing/pricing-section";

export const metadata: Metadata = {
  title: "Pricing — doc2mcp",
  description:
    "Free forever for tinkering. Starter $3.99, Pro $14.99, Team $39.99. Monthly, 6-month, or yearly billing.",
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
