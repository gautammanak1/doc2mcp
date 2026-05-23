import { FlowShowcase } from "@/components/landing/conversion-demo";
import { CtaSection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { FooterSection } from "@/components/landing/footer-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingNavigation } from "@/components/landing/navigation";
import { PricingSection } from "@/components/landing/pricing-section";

export default function Page() {
  return (
    <main className="landing-page relative min-h-screen overflow-x-hidden noise-overlay">
      <LandingNavigation />
      <HeroSection />
      <FlowShowcase />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
