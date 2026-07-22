import { Navbar } from '@/features/marketing/ui/Navbar';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, Body } from '@/features/marketing/ui/Typography';
import { Button } from '@/features/marketing/ui/Button';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { NAVIGATION } from '@/constants/navigation';

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const bookingId = typeof resolvedParams.id === 'string' ? resolvedParams.id : null;
  const shortId = bookingId ? bookingId.substring(0, 8).toUpperCase() : "UNKNOWN";

  // WhatsApp configuration
  const whatsappNumber = "919876543210";
  const whatsappMessage = encodeURIComponent(`Hello,\n\nI have booked a demo session through PsySphere.\n\nReference ID: ${shortId}`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen bg-brand-canvas flex flex-col pt-32">
      <Navbar />
      <section className="py-24 flex-1 flex flex-col justify-center">
        <Container>
          <div className="max-w-2xl mx-auto bg-white p-12 rounded-[32px] border border-brand-border shadow-sm text-center">
            <div className="w-20 h-20 bg-brand-success/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-10 h-10 text-brand-success" />
            </div>
            
            <H1 className="mb-4">Thank You!</H1>
            <Body className="mb-8">
              Your demo request has been successfully received. Our team will contact you shortly to confirm the details.
            </Body>

            {bookingId && (
              <div className="bg-brand-canvas/50 rounded-2xl p-6 border border-brand-border mb-10">
                <p className="text-sm text-brand-text-muted mb-2">Reference ID</p>
                <p className="font-mono text-xl font-bold tracking-wider">{shortId}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="pt-8 border-t border-brand-border">
                <p className="font-medium mb-4">Need immediate assistance?</p>
                <Button href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="primary" className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-transparent">
                  <span className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Chat with us on WhatsApp
                  </span>
                </Button>
              </div>

              <div>
                <Button href={NAVIGATION.home} variant="ghost" className="w-full">
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
      <Footer />
    </main>
  );
}
