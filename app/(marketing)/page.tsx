import { Suspense } from "react";
import { CtaSection } from "@/components/landing/cta-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { FooterSection } from "@/components/landing/footer-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSectionClient } from "@/components/landing/how-it-works-client";
import { LandingNavigation } from "@/components/landing/navigation";
import { LandingNavigationServer } from "@/components/landing/navigation-server";
import { PricingSection } from "@/components/landing/pricing-section";
import { ProblemSectionClient } from "@/components/landing/problem-section-client";

export default function Page() {
  return (
    <main className="landing-page relative min-h-screen overflow-x-hidden">
      <Suspense fallback={<LandingNavigation session={null} />}>
        <LandingNavigationServer />
      </Suspense>

      <HeroSection />
      <ProblemSectionClient />
      <HowItWorksSectionClient />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
