import { GraduationCap, HeartHandshake, Check } from 'lucide-react';
import { Container } from './Container';
import { H2, Eyebrow } from './Typography';

/** Honest, checkable facts about how classes run. Add student numbers here only once verified. */
const sides = [
  {
    icon: GraduationCap,
    who: 'For students',
    title: 'Understand the theory, then write it the way examiners mark it.',
    tint: 'bg-mint',
    points: [
      'Small live batches, so you get time to ask your doubts',
      'Theories tied to examples from your own day',
      'Board-style answers checked with written feedback',
      'A short weekly test to keep revision small',
    ],
  },
  {
    icon: HeartHandshake,
    who: 'For parents',
    title: 'Know how your child is doing, every week.',
    tint: 'bg-lilac',
    points: [
      'A progress report by email every Sunday',
      'Attendance and test scores in plain language',
      'Fees listed upfront and paid online through Razorpay',
      'Sit in on a free workshop before you decide',
    ],
  },
];

export function TrustSection() {
  return (
    <section aria-label="Who it’s for" className="py-24 sm:py-32">
      <Container>
        <div className="mb-14 flex max-w-2xl flex-col gap-4">
          <Eyebrow>Who it’s for</Eyebrow>
          <H2 className="text-balance">
            Built for both sides of the <em>study table.</em>
          </H2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {sides.map(({ icon: Icon, ...s }) => (
            <div key={s.who} className="flex flex-col gap-6 rounded-[32px] border border-line bg-surface p-7 sm:p-10">
              <div className="flex items-center gap-3">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.tint} text-forest-800`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-500">{s.who}</span>
              </div>
              <h3 className="font-serif text-[34px] leading-[1.05] text-ink-900">{s.title}</h3>
              <ul className="flex flex-col gap-3.5">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[16px] leading-relaxed text-ink-700">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-800 text-paper">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
