import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/features/marketing/ui/LegalPage';

export const metadata: Metadata = {
  title: 'Refund Policy | Saarthi Classes',
  description: 'When Saarthi Classes refunds fees, and how to ask for a refund.',
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Fees"
      title="Refund Policy"
      updated="23 October 2026"
      sections={[
        {
          heading: 'Try a free workshop first',
          body: (
            <p>
              Anyone can join a free live workshop with Dravina Gupta before paying. You see how she teaches, then decide
              whether to join a batch. You pay all fees online through Razorpay, and we confirm your seat once the payment
              succeeds.
            </p>
          ),
        },
        {
          heading: 'Refund window',
          body: (
            <>
              <p>
                If you decide the course doesn’t suit you within <strong>7 calendar days</strong> of joining your batch and
                paying the fee, you can ask for a full refund.
              </p>
              <p>After those 7 days we can’t refund fees or move you to another batch, because each batch has a fixed number of seats.</p>
            </>
          ),
        },
        {
          heading: 'When we don’t refund',
          body: (
            <>
              <p>We don’t refund fees if:</p>
              <ul>
                <li>we receive the request more than 7 days after the batch starts;</li>
                <li>we suspend or remove a student for breaking the code of conduct in our Terms;</li>
                <li>the student has completed more than 50% of a crash course.</li>
              </ul>
            </>
          ),
        },
        {
          heading: 'How to ask for a refund',
          body: (
            <>
              <p>
                Send us a message through the <Link href="/contact">contact form</Link> with your full name, batch name, the
                date you joined and your payment receipt.
              </p>
              <p>
                Once we approve it, Razorpay returns the money to your original payment method (UPI, card, net banking or
                wallet) within <strong>5 to 7 business days</strong>.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
