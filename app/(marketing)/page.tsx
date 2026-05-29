import { Suspense } from "react";
import { AutoSyncSection } from "@/components/landing/auto-sync-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { FlowShowcase } from "@/components/landing/conversion-demo";
import { CtaSection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { FooterSection } from "@/components/landing/footer-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingNavigation } from "@/components/landing/navigation";
import { LandingNavigationServer } from "@/components/landing/navigation-server";
import { PricingSection } from "@/components/landing/pricing-section";
import { ProblemSectionClient } from "@/components/landing/problem-section-client";
import { ToolsStripSection } from "@/components/landing/tools-strip-section";

export default function Page() {
  return (
    <main className="landing-page relative min-h-screen overflow-x-hidden noise-overlay">
      <Suspense fallback={<LandingNavigation session={null} />}>
        <LandingNavigationServer />
      </Suspense>
      <HeroSection />
      <ToolsStripSection />
      <ProblemSectionClient />
      <FlowShowcase />
      <FeaturesSection />
      <HowItWorksSection />
      <AutoSyncSection />
      <ComparisonSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
