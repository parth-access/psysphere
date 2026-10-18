import { Navbar } from '@/features/marketing/ui/Navbar';
import { Pricing } from '@/features/marketing/ui/Pricing';
import { Footer } from '@/features/marketing/ui/Footer';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-paper flex flex-col pt-24">
      <Navbar />
      <Pricing />
      <div className="flex-1"></div>
      <Footer />
    </main>
  );
}
