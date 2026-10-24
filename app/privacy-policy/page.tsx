import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/features/marketing/ui/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | Saarthi Classes',
  description: 'What personal data Saarthi Classes collects, why, and who we share it with.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="23 October 2026"
      sections={[
        {
          heading: 'Introduction',
          body: (
            <p>
              This policy explains what personal data Saarthi Classes collects, how we use it and who we share it with. It
              covers this website, the student dashboard and our classes.
            </p>
          ),
        },
        {
          heading: 'Accounts',
          body: (
            <p>
              When you join a batch or we create a teacher account, we record the student’s full name, email address, mobile
              number and class, and a parent or guardian’s name and mobile number. We use these details to set up your
              dashboard, place you in a batch and tell you about your classes.
            </p>
          ),
        },
        {
          heading: 'What we collect and why',
          body: (
            <p>
              You give us information when you register for a free workshop, request a seat in a batch, contact us or use the
              dashboard. This covers your contact details, attendance, assignment submissions, test scores and teacher
              feedback. We use it to track your progress, give you feedback and send the weekly report.
            </p>
          ),
        },
        {
          heading: 'Cookies',
          body: (
            <p>
              We use cookies to keep you signed in to the dashboard. You can block cookies in your browser settings, but you
              won’t be able to sign in without them.
            </p>
          ),
        },
        {
          heading: 'Emails',
          body: (
            <p>
              We email you workshop confirmations, updates on your join request, payment confirmations, password links and
              the weekly progress report. You can ask us to stop promotional emails at any time. We keep sending emails about
              an active student account while it stays open.
            </p>
          ),
        },
        {
          heading: 'Security',
          body: (
            <p>
              We store your data with Supabase and host the site on Vercel. Your browser connects to the site over HTTPS.
              Students see their own records; teachers and admins sign in with their own accounts to see the batches they
              manage.
            </p>
          ),
        },
        {
          heading: 'Who we share data with',
          body: (
            <p>
              We don’t sell or trade student data. We share only what each service needs to run Saarthi Classes: Razorpay
              (payments; we never see or store your card or bank details), Google (Calendar and Meet links for classes),
              Resend (email delivery), Supabase (database, login and file storage) and Vercel (hosting).
            </p>
          ),
        },
        {
          heading: 'Your rights and contact',
          body: (
            <p>
              To see the data we hold about you, correct it or have it deleted, message us through the{' '}
              <Link href="/contact">contact form</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
