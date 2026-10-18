import { Navbar } from '@/features/marketing/ui/Navbar';
import { Hero } from '@/features/marketing/ui/Hero';
import { TrustSection } from '@/features/marketing/ui/TrustSection';
import { WhyUs } from '@/features/marketing/ui/WhyUs';
import { Courses } from '@/features/marketing/ui/Courses';
import { Pricing } from '@/features/marketing/ui/Pricing';
import { TeacherProfile } from '@/features/marketing/ui/TeacherProfile';
import { Testimonials } from '@/features/marketing/ui/Testimonials';
import { ClosingCta } from '@/features/marketing/ui/ClosingCta';
import { Footer } from '@/features/marketing/ui/Footer';

// Refresh every 5 minutes so the "next workshop" card stays current.
export const revalidate = 300;

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main id="main">
        <Hero />
        <TrustSection />
        <WhyUs />
        <Pricing />
        <Courses />
        <TeacherProfile />
        <Testimonials />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
