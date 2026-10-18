import { Navbar } from '@/features/marketing/ui/Navbar';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, H2, Body } from '@/features/marketing/ui/Typography';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-brand-canvas flex flex-col">
      <Navbar />
      
      <section className="pt-36 pb-20 bg-white border-b border-brand-border">
        <Container>
          <div className="max-w-3xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-6">
              Legal Policy
            </span>
            <H1 className="mb-4">Privacy Policy</H1>
            <p className="text-sm text-brand-text-muted">Last Updated: August 2, 2026</p>
          </div>
        </Container>
      </section>

      <section className="py-20 bg-brand-canvas flex-1">
        <Container>
          <div className="max-w-3xl mx-auto bg-white p-10 md:p-12 rounded-2xl border border-brand-border space-y-8 text-sm text-brand-text leading-relaxed">
            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">1. Introduction</h3>
              <p>
                At Saarthi Classes, we respect your privacy and are committed to protecting any personal data we collect. This Privacy Policy outlines how we collect, use, process, and protect your information when you enroll in our coaching programs, access our portal, or visit our marketing website.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">2. Accounts & Onboarding</h3>
              <p>
                When you register for a student or teacher account with Saarthi Classes, we collect registration details including your full name, email address, school grade, parent/guardian contact info, and study preferences. This data is strictly used to provision your personalized learning dashboard, assign batches, and communicate important classroom updates.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">3. Data Collection & Usage</h3>
              <p>
                We collect information directly provided by you during registration or demo-booking, including contact emails, student answers, feedback, and performance tracking sheets. This information is processed to maintain academic tracking, provide comprehensive performance feedback, and personalize your educational path.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">4. Cookies & Analytics</h3>
              <p>
                We use small text files (cookies) to keep you securely signed in to your student dashboard and to collect anonymous usage metrics through modern web tools. You can customize your cookie preferences through your browser settings, although some features of the interactive student portal may not function fully if cookies are entirely disabled.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">5. Email Communications</h3>
              <p>
                We may use your email address to send academic materials, program newsletters, feedback reports, and notifications about upcoming class timings. You can opt-out of general promotional lists at any time, but transactional and academic-critical emails regarding active student accounts will continue to be sent.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">6. Data Security</h3>
              <p>
                We implement industry-standard administrative, electronic, and physical safeguards to defend your personal information from unauthorized access, loss, or disclosure. All interactive dashboards are secured using TLS encryption and hosted in secure, vetted cloud facilities.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">7. Third-Party Services</h3>
              <p>
                We never sell or trade student data to third-party ad brokers. We only share essential, scoped information with verified sub-processors such as email delivery networks, hosting environments, and database storage modules necessary to run the student experience.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-brand-text mb-3">8. Contact & Compliance</h3>
              <p>
                If you have questions about how we treat your data, or if you would like to request file access, rectification, or complete erasure of your personal records from our databases, please contact us directly through our <Link href="/contact" className="font-semibold text-brand-primary hover:underline">Contact Form</Link>.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
