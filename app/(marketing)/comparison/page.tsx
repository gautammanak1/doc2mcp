import type { Metadata } from "next";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FooterSection } from "@/components/landing/footer-section";
import { LandingNavigation } from "@/components/landing/navigation";

export const metadata: Metadata = {
  title: "doc2mcp vs ArcMCP, mcp-forge, Mintlify, Stainless — Comparison",
  description:
    "Why doc2mcp is the AI-native docs-to-MCP platform: smart toolkits, workflow inference, visual graph, live playground, and an AI understanding score — all on ASI1.",
};

export default function ComparisonPage() {
  return (
    <main className="landing-page relative min-h-screen overflow-x-hidden noise-overlay">
      <LandingNavigation />
      <div className="h-20" />
      <ComparisonSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
