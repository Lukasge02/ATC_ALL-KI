import { HeroSection } from "@/components/features/hero-section";
import { FeaturesSection } from "@/components/features/features-section";
import { CTASection } from "@/components/features/cta-section";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
