import { Navbar } from '@/features/marketing/ui/Navbar';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, H2, Body } from '@/features/marketing/ui/Typography';
import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-brand-canvas flex flex-col">
      <Navbar />
      
      {/* Editorial Header */}
      <section className="pt-36 pb-20 bg-white border-b border-brand-border">
        <Container>
          <div className="max-w-3xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-6">
              Tuition Policy
            </span>
            <H1 className="mb-4">Refund Policy</H1>
            <p className="text-sm text-brand-text-muted">Last Updated: August 2, 2026</p>
          </div>
        </Container>
      </section>

      {/* Policy Details */}
      <section className="py-20 bg-brand-canvas flex-1">
        <Container>
          <div className="max-w-3xl mx-auto bg-white p-10 md:p-12 rounded-2xl border border-brand-border space-y-8 text-sm text-brand-text leading-relaxed">
            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">1. Transparency &amp; Demos First</h3>
              <p>
                We believe that every student deserves a learning environment that matches their pace. To guarantee transparency, Saarthi Classes provides a completely free, complimentary demo class with Dravina Gupta prior to any tuition payment. This ensures that you can experience our conceptual and compassionate teaching firsthand before making any financial commitment.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">2. Refund Timeline</h3>
              <p>
                If, within <span className="font-semibold text-brand-text">7 calendar days</span> of joining your formal batch and paying your fee, you decide that our program does not fit your requirements, you are eligible to request a full refund. 
              </p>
              <p className="mt-2">
                After the 7-day period has elapsed, we cannot offer any refunds or class adjustments as academic slots and seats are strictly limited and curated.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">3. Non-Refundable Situations</h3>
              <p>
                Refunds will not be initiated under the following circumstances:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 pl-2">
                <li>If the request is received after 7 days of formal batch commencement.</li>
                <li>If a student is suspended or removed from classes due to violations of our student code of conduct or disruptive behaviour.</li>
                <li>If a student has already completed more than 50% of an intensive crash course.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">4. Processing Requests</h3>
              <p>
                To request a refund, please send a simple, direct message through our <Link href="/contact" className="font-semibold text-brand-primary hover:underline">Contact Form</Link> with your full name, registered batch name, date of enrollment, and billing receipt. 
              </p>
              <p className="mt-2">
                Our team handles these requests with utmost empathy and respect. Once approved, the refund will be credited back to your original payment mode within <span className="font-semibold text-brand-text">5 to 7 business days</span>.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
