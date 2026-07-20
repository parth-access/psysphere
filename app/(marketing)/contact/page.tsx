import { Navbar } from '@/features/marketing/ui/Navbar';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, Body } from '@/features/marketing/ui/Typography';
import { Button } from '@/features/marketing/ui/Button';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-brand-canvas flex flex-col pt-32">
      <Navbar />
      <section className="py-24 flex-1" id="contact">
        <Container>
          <div className="max-w-2xl mx-auto bg-white p-12 rounded-[32px] border border-brand-border shadow-sm text-center">
            <H1 className="mb-6">Get in Touch</H1>
            <Body className="mb-8">
              Have questions about our programs? We&apos;re here to help you make the right choice for your child&apos;s future.
            </Body>
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <Button variant="primary" className="w-full">
                Message on WhatsApp
              </Button>
              <Button variant="secondary" className="w-full">
                Email Us
              </Button>
              <div className="mt-8 pt-8 border-t border-brand-border text-brand-text-muted">
                <p>📍 New Delhi, India</p>
                <p className="mt-2">📞 +91 98765 43210</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
      <Footer />
    </main>
  );
}
