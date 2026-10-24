import { BookOpen, PenLine, Timer, FileBarChart } from 'lucide-react';
import { Container } from './Container';
import { H2, Body, Eyebrow, Note } from './Typography';

const steps = [
  { icon: BookOpen, tag: 'Understand', title: 'Live concept classes', desc: 'Dravina teaches each theory through an experiment or an example from daily life.', tint: 'bg-mint' },
  { icon: PenLine, tag: 'Write', title: 'Answer-writing practice', desc: 'Board-style answers, checked with written feedback.', tint: 'bg-sky' },
  { icon: Timer, tag: 'Test', title: 'A short weekly test', desc: 'Timed, then reviewed together in the next class.', tint: 'bg-lilac' },
  { icon: FileBarChart, tag: 'Report', title: 'Parents see progress', desc: 'We email scores and attendance to parents each Sunday.', tint: 'bg-peach' },
];

export function WhyUs() {
  return (
    <section id="how-it-works" className="relative bg-paper-deep py-24 sm:py-32">
      <Container>
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-xl flex-col gap-4">
            <Eyebrow>How it works</Eyebrow>
            <H2>
              The same rhythm, <em>every week.</em>
            </H2>
            <Body>You know what each week holds, and you go into the exam having revised all year.</Body>
          </div>
          <Note className="hidden -rotate-3 sm:block">no last-minute cramming!</Note>
        </div>
        <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-[52px] hidden border-t-2 border-dashed border-ink-300 lg:block" aria-hidden="true" />
          {steps.map(({ icon: Icon, ...s }, i) => (
            <li key={s.tag} className="relative flex flex-col gap-4 rounded-[28px] bg-surface p-7 shadow-soft">
              <div className="flex items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.tint} text-forest-800`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="font-serif text-5xl leading-none text-ink-300">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <p className="pt-2 text-[12px] font-bold uppercase tracking-[0.14em] text-forest-800">{s.tag}</p>
              <h3 className="text-xl font-bold tracking-tight text-ink-900">{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-ink-500">{s.desc}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
