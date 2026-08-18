import { Suspense } from 'react';
import { Navbar } from '@/features/marketing/ui/Navbar';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, Body } from '@/features/marketing/ui/Typography';
import { BookingForm } from '@/features/marketing/ui/BookingForm';

export default function BookDemoPage() {
  return (
    <main className="min-h-screen bg-brand-canvas flex flex-col pt-32">
      <Navbar />
      <section className="py-24 flex-1">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <H1 className="mb-6">Book a Free Demo Class</H1>
            <Body>
              Experience our teaching methodology firsthand. Fill out the details below and we&apos;ll schedule a session.
            </Body>
          </div>
          
          <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading form...</div>}>
            <BookingForm />
          </Suspense>
        </Container>
      </section>
      <Footer />
    </main>
  );
}
