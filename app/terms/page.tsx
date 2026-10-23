import type { Metadata } from 'next';
import { LegalPage } from '@/features/marketing/ui/LegalPage';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Saarthi Classes',
  description: 'The terms for joining Saarthi Classes and using the student dashboard.',
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      updated="23 October 2026"
      sections={[
        {
          heading: 'Agreeing to these terms',
          body: (
            <p>
              When you join a Saarthi Classes course or use the student dashboard, you agree to these terms. They apply to
              students, parents and anyone who visits the website or attends a class.
            </p>
          ),
        },
        {
          heading: 'Conduct',
          body: (
            <p>
              Treat other students, teachers and staff with respect. We may suspend a student without a refund for
              harassment, disrupting a live class or sharing offensive material in class groups.
            </p>
          ),
        },
        {
          heading: 'Study material',
          body: (
            <p>
              Dravina Gupta and Saarthi own the study material, booklets, templates, worksheets, videos, tests and model
              answers we give you. You may not copy, record, share or sell any of it without our written permission.
            </p>
          ),
        },
        {
          heading: 'Fees and payment',
          body: (
            <p>
              Each plan lists its fee upfront, and you pay online through Razorpay before joining a batch. We confirm a seat
              once the payment succeeds; for some batches we also approve the request before you pay. Prices are in Indian
              Rupees (INR) unless we state otherwise. If a recurring fee goes unpaid, we may pause access to classes and the
              dashboard until you pay.
            </p>
          ),
        },
        {
          heading: 'Your account',
          body: (
            <p>
              Your login is for you alone; don’t share it. Keep your password private and tell us if you think someone else
              has used your account. Don’t try to break into our systems, copy our databases or run scrapers or bots on the
              dashboard.
            </p>
          ),
        },
        {
          heading: 'Results',
          body: (
            <p>
              We can’t guarantee exam scores or university admissions. Your results depend on your own work.
            </p>
          ),
        },
        {
          heading: 'Changes to these terms',
          body: (
            <p>
              We may update these terms. If you keep using the dashboard or attending classes after a change, you accept the
              updated terms.
            </p>
          ),
        },
        {
          heading: 'Governing law',
          body: (
            <p>
              The laws of India govern these terms. The courts in Delhi, India, have exclusive jurisdiction over any dispute
              about them.
            </p>
          ),
        },
      ]}
    />
  );
}
