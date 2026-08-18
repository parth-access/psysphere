import { Navbar } from '@/features/marketing/ui/Navbar';
import { Hero } from '@/features/marketing/ui/Hero';
import { TrustSection } from '@/features/marketing/ui/TrustSection';
import { WhyUs } from '@/features/marketing/ui/WhyUs';
import { Courses } from '@/features/marketing/ui/Courses';
import { Pricing } from '@/features/marketing/ui/Pricing';
import { TeacherProfile } from '@/features/marketing/ui/TeacherProfile';
import { Testimonials } from '@/features/marketing/ui/Testimonials';
import { Footer } from '@/features/marketing/ui/Footer';

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-brand-canvas flex flex-col">
      <Navbar />
      <Hero />
      <TrustSection />
      <WhyUs />
      <Courses />
      <Pricing />
      <TeacherProfile />
      <Testimonials />
      <Footer />
    </main>
  );
}
