import type { Metadata } from "next";
import { StatsSection } from "@/components/common/AnimatedStats";
import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { CTASection } from "@/components/landing/cta";
import { FeaturesSection } from "@/components/landing/features";
import Hero from "@/components/landing/hero-section";
import { FreePricing } from "@/components/landing/pricing";

export const metadata: Metadata = {
  title: "Omnix - AI-Powered Notebooks",
  description: "Transform your ideas, class notes, meetings, and research into clean AI-generated notebooks",
};

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <StatsSection />
      <FeaturesSection />
      <FreePricing />
      <CTASection />
      <Footer />
    </>
  );
}
