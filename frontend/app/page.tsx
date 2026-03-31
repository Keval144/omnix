import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
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

export default async function Home() {
  const session = await getSession();
  
  if (session?.session) {
    redirect("/dashboard");
  }

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
