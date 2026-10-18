import { Container } from './Container';
import { H2, Body, Eyebrow } from './Typography';

const steps = [
  { n: '01', tag: 'Understand', title: 'Live concept classes', desc: 'Theories explained with everyday examples, not memorised lists.' },
  { n: '02', tag: 'Write', title: 'Answer-writing practice', desc: 'Board-style answers, checked with written feedback.' },
  { n: '03', tag: 'Test', title: 'A short weekly test', desc: 'Timed, then reviewed together in the next class.' },
  { n: '04', tag: 'Report', title: 'Parents see progress', desc: 'Scores and attendance, every week, in plain language.' },
];

export function WhyUs() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24">
      <Container>
        <div className="mb-12 max-w-xl">
          <Eyebrow className="mb-3">How it works</Eyebrow>
          <H2 className="mb-3">The same rhythm every week</H2>
          <Body>So students always know what comes next, and nothing is left to the night before the exam.</Body>
        </div>
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.n} className={`flex flex-col gap-2.5 border-t-2 pt-5 ${i === steps.length - 1 ? 'border-marigold-500' : 'border-ink-900'}`}>
              <p className="text-[13px] font-semibold text-marigold-700">
                {s.n} · {s.tag}
              </p>
              <h3 className="text-xl font-semibold text-ink-900">{s.title}</h3>
              <p className="text-[16px] leading-relaxed text-ink-500">{s.desc}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
