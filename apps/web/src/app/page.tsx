import React from 'react';
import { Hero } from '@/components/home/Hero';
import { CategoryCards } from '@/components/home/CategoryCards';
import { BeforeAfterSlider } from '@/components/home/BeforeAfterSlider';
import { ServicesSection } from '@/components/home/ServicesSection';
import { EditorialProjects } from '@/components/home/EditorialProjects';
import { PackagesSection } from '@/components/home/PackagesSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CtaBanner } from '@/components/home/CtaBanner';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* SECTION 1 — Cinematic Hero */}
      <Hero />

      {/* SECTION 2 — What are you celebrating? */}
      <CategoryCards />

      {/* SECTION 3 — From Empty Space to Unforgettable (Before/After Slider) */}
      <BeforeAfterSlider />

      {/* SECTION 4 — Bespoke Services */}
      <ServicesSection />

      {/* SECTION 5 — Editorial Projects */}
      <EditorialProjects />

      {/* SECTION 6 — Packages */}
      <PackagesSection />

      {/* SECTION 7 — How It Works */}
      <HowItWorks />

      {/* SECTION 8 — Testimonials */}
      <TestimonialsSection />

      {/* SECTION 9 — Large Call To Action */}
      <CtaBanner />
    </main>
  );
}
