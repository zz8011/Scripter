/* ==================================================
   首页 - 完整着陆页
   ================================================== */

import { LandingNavbar } from "@/components/landing-navbar";
import { LandingHero } from "@/components/landing-hero";
import { LandingFeatures } from "@/components/landing-features";
import { LandingProcess } from "@/components/landing-process";
import { LandingCTA } from "@/components/landing-cta";
import { LandingFooter } from "@/components/landing-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
      {/* 背景纹理和渐变效果 Background Textures */}
      <div className="paper-overlay"></div>
      <div className="fixed inset-0 pointer-events-none gradient-mesh"></div>

      {/* Navigation */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <LandingHero />

        {/* Features Section */}
        <LandingFeatures />

        {/* Process Section */}
        <LandingProcess />

        {/* CTA Section */}
        <LandingCTA />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
