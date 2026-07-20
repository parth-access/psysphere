import { Navbar } from '@/features/marketing/ui/Navbar';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, Body } from '@/features/marketing/ui/Typography';

export default function BookDemoPage() {
  return (
    <main className="min-h-screen bg-brand-canvas flex flex-col pt-32">
      <Navbar />
      <section className="py-24 flex-1">
        <Container>
          <div className="max-w-3xl mx-auto bg-white p-12 rounded-[32px] border border-brand-border shadow-sm text-center">
            <H1 className="mb-6">Book a Free Demo Class</H1>
            <Body className="mb-8">
              Experience our teaching methodology firsthand. Fill out the details below and we&apos;ll schedule a session.
            </Body>
            
            <div className="bg-brand-canvas/50 rounded-2xl p-8 border border-brand-border">
              {/* We can build a complete form here later */}
              <p className="text-brand-text-muted italic">Booking form integration coming in the next phase...</p>
            </div>
          </div>
        </Container>
      </section>
      <Footer />
    </main>
  );
}
