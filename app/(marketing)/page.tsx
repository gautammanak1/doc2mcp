import { Suspense } from "react";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { CtaSection } from "@/components/landing/cta-section";
import { EnterpriseSection } from "@/components/landing/enterprise-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { FooterSection } from "@/components/landing/footer-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingNavigation } from "@/components/landing/navigation";
import { LandingNavigationServer } from "@/components/landing/navigation-server";
import { PricingSection } from "@/components/landing/pricing-section";
import { ProblemSectionClient } from "@/components/landing/problem-section-client";
import { RealExampleSection } from "@/components/landing/real-example-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { ToolsStripSection } from "@/components/landing/tools-strip-section";
import { UseCasesSection } from "@/components/landing/use-cases-section";
import { WhyNowSection } from "@/components/landing/why-now-section";
import { WhyTeamsSection } from "@/components/landing/why-teams-section";

export default function Page() {
  return (
    <main className="landing-page relative min-h-screen overflow-x-hidden noise-overlay">
      <Suspense fallback={<LandingNavigation session={null} />}>
        <LandingNavigationServer />
      </Suspense>
      <HeroSection />
      <ToolsStripSection />
      <ProblemSectionClient />
      <RealExampleSection />
      <HowItWorksSection />
      <FeaturesSection />
      <WhyTeamsSection />
      <UseCasesSection />
      <ComparisonSection />
      <EnterpriseSection />
      <WhyNowSection />
      <SocialProofSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
