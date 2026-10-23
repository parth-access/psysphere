import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Container } from './Container';
import { H2, Body, Eyebrow } from './Typography';
import { NAVIGATION } from '@/constants/navigation';

const faqs = [
  {
    q: 'Is the workshop free?',
    a: 'Yes. Workshops cost nothing and run live on Google Meet. Parents can sit in. You see how Dravina teaches before you pay.',
  },
  {
    q: 'Which syllabus do you follow?',
    a: 'We follow the CBSE psychology syllabus (NCERT) for Class 11 and Class 12. The CUET-UG and Boards + CUET tracks add MCQ practice and mock tests on the same chapters.',
  },
  {
    q: 'How big are the batches?',
    a: 'We keep batches small so Dravina knows each student and has time for doubts in class. The join page shows how many seats each batch has left.',
  },
  {
    q: 'How will I know how my child is doing?',
    a: 'We email you a progress report each Sunday with that week’s attendance and test scores.',
  },
  {
    q: 'How do I join and pay?',
    a: 'Request a seat on the join page. For some batches we approve the request first. Once your seat is confirmed you pay online through Razorpay, and we create your login straight away.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <Eyebrow>Questions</Eyebrow>
          <H2>
            Questions parents <em>ask us.</em>
          </H2>
          <Body>
            Something else on your mind? <Link href={NAVIGATION.contact} className="font-bold text-forest-800 underline decoration-gold-500 decoration-2 underline-offset-4">Ask us directly</Link>, or read the{' '}
            <Link href="/refund-policy" className="font-bold text-forest-800 underline decoration-gold-500 decoration-2 underline-offset-4">refund policy</Link>.
          </Body>
        </div>
        <div className="flex flex-col gap-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-[24px] border border-line bg-surface px-6 py-5 open:shadow-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-bold text-ink-900 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-800 transition-transform group-open:rotate-45">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </span>
              </summary>
              <p className="pt-3 text-[16px] leading-relaxed text-ink-500">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
