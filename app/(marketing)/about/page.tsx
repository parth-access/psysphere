import { Navbar } from '@/features/marketing/ui/Navbar';
import { TeacherProfile } from '@/features/marketing/ui/TeacherProfile';
import { Footer } from '@/features/marketing/ui/Footer';
import { TrustSection } from '@/features/marketing/ui/TrustSection';
import { WhyUs } from '@/features/marketing/ui/WhyUs';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-canvas flex flex-col pt-32">
      <Navbar />
      <TeacherProfile />
      <WhyUs />
      <TrustSection />
      <div className="flex-1"></div>
      <Footer />
    </main>
  );
}
