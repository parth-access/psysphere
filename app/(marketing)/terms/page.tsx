import { Navbar } from '@/features/marketing/ui/Navbar';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, H2, Body } from '@/features/marketing/ui/Typography';

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-brand-canvas flex flex-col">
      <Navbar />
      
      <section className="pt-36 pb-20 bg-white border-b border-brand-border">
        <Container>
          <div className="max-w-3xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-6">
              Legal Terms
            </span>
            <H1 className="mb-4">Terms &amp; Conditions</H1>
            <p className="text-sm text-brand-text-muted">Last Updated: August 2, 2026</p>
          </div>
        </Container>
      </section>

      <section className="py-20 bg-brand-canvas flex-1">
        <Container>
          <div className="max-w-3xl mx-auto bg-white p-10 md:p-12 rounded-[32px] border border-brand-border shadow-sm space-y-8 text-sm text-brand-text leading-relaxed">
            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">1. Use of Service</h3>
              <p>
                By enrolling in any of PsySphere&apos;s educational programs or accessing our student dashboard, you agree to comply with and be bound by these Terms &amp; Conditions. These terms apply to all students, parents, and visitors who access our website or classroom services.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">2. Student Responsibilities &amp; Conduct</h3>
              <p>
                Students are expected to maintain highest academic standards and treat peers, teachers, and staff with kindness and dignity. Any form of harassment, disruptive classroom behaviour during live interactive sessions, or sharing of offensive materials within the peer groups is strictly prohibited and can result in immediate suspension without refund.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">3. Intellectual Property</h3>
              <p>
                All study materials, curated booklets, templates, assignment worksheets, videos, tests, and mock solutions provided by PsySphere are the exclusive intellectual property of Dravina Gupta and Saarthi. No part of these resources may be copied, recorded, distributed, or resold to any third party without explicit prior written consent.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">4. Payments &amp; Fee Terms</h3>
              <p>
                Class fees must be paid in full or installments as agreed upon prior to joining the specific academic batch. All pricing figures on the platform are in Indian Rupees (INR) unless specified otherwise. Access to live classrooms and student dashboards may be suspended if recurring fees are not paid on time.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">5. Platform Usage &amp; Access</h3>
              <p>
                Account sharing is strictly prohibited. You are responsible for keeping your credentials confidential and notifying us of any unauthorized security breaches. You agree not to attempt to breach our server firewalls, reverse-engineer platform databases, or deploy scrapers/bots on the student interface.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">6. Limitation of Liability</h3>
              <p>
                While PsySphere strives to provide premium, highly conceptual educational support, we make no guarantees regarding specific standardized exam score outcomes or university admission decisions, as final performance rests ultimately with the student&apos;s individual effort.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">7. Updates to Terms</h3>
              <p>
                We reserve the right to revise or update these Terms &amp; Conditions periodically. Continued use of our educational portal or attendance in our online classes after changes take effect indicates your agreement with the updated terms.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">8. Governing Law</h3>
              <p>
                These terms shall be governed by and construed in accordance with the laws of India. Any legal disputes arising out of these terms shall be subject to the exclusive jurisdiction of the competent courts in Delhi, India.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
