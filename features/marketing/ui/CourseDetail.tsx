import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Container } from './Container';
import { H1, H2, Body, Eyebrow, Note } from './Typography';
import { Button } from './Button';
import { ClosingCta } from './ClosingCta';

export type CourseDetailProps = {
  /** Big serif mark on the hero card, e.g. "11" */
  mark: string;
  /** Tailwind background class for the course colour, e.g. "bg-mint" */
  tint: string;
  eyebrow: string;
  title: string;
  intro: string;
  facts: { label: string; value: string }[];
  chapters: string[];
  chaptersNote?: string;
  focus: { title: string; desc: string }[];
  included: { title: string; desc: string }[];
  idealFor: string[];
  faqs: { q: string; a: string }[];
  joinHref: string;
  feesHref: string;
};

export function CourseDetail(c: CourseDetailProps) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden pb-20 pt-32 sm:pt-40">
          <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" aria-hidden="true" />
          <Container className="relative grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div className="flex flex-col items-start gap-6">
              <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-ink-900">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All courses
              </Link>
              <Eyebrow>{c.eyebrow}</Eyebrow>
              <H1 className="lg:!text-[76px]">{c.title}</H1>
              <Body className="max-w-xl text-[18px]">{c.intro}</Body>
              <div className="flex flex-wrap gap-3">
                <Button href={c.joinHref} className="!min-h-14 !px-7 text-base">
                  Join this course <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button href="/workshops" variant="outline" className="!min-h-14 !px-7 text-base">
                  Try a free workshop
                </Button>
              </div>
            </div>
            <div className={`relative rounded-[36px] ${c.tint} p-8 sm:p-10`}>
              <span className="font-serif text-[120px] leading-[0.8] text-forest-800 sm:text-[150px]">{c.mark}</span>
              <dl className="mt-8 flex flex-col divide-y divide-ink-900/10">
                {c.facts.map((f) => (
                  <div key={f.label} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-700">{f.label}</dt>
                    <dd className="text-right text-[15px] font-semibold text-ink-900">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Container>
        </section>

        {/* Syllabus */}
        <section className="bg-paper-deep py-24 sm:py-28">
          <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div className="flex flex-col gap-4">
              <Eyebrow>Syllabus</Eyebrow>
              <H2>
                What you’ll <em>cover.</em>
              </H2>
              {c.chaptersNote && <Body>{c.chaptersNote}</Body>}
              <div className="mt-4 flex flex-col gap-4">
                {c.focus.map((f) => (
                  <div key={f.title} className="rounded-[24px] bg-surface p-6 shadow-soft">
                    <h3 className="mb-1.5 text-lg font-bold text-ink-900">{f.title}</h3>
                    <p className="text-[15px] leading-relaxed text-ink-500">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <ol className="flex flex-col gap-2">
              {c.chapters.map((ch, i) => (
                <li key={ch} className="flex items-center gap-5 rounded-[20px] border border-line bg-surface px-5 py-4">
                  <span className="w-10 shrink-0 font-serif text-3xl leading-none text-forest-800">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[16px] font-semibold text-ink-900">{ch}</span>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Included */}
        <section className="py-24 sm:py-28">
          <Container>
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div className="flex max-w-xl flex-col gap-4">
                <Eyebrow>What’s included</Eyebrow>
                <H2>
                  What comes with <em>your plan.</em>
                </H2>
              </div>
              <Button href={c.feesHref} variant="ghost">
                See fees for this course <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {c.included.map((f) => (
                <div key={f.title} className="flex flex-col gap-3 rounded-[28px] border border-line bg-surface p-7">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-paper">
                    <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-bold text-ink-900">{f.title}</h3>
                  <p className="text-[15px] leading-relaxed text-ink-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Ideal for + FAQ */}
        <section className="pb-24 sm:pb-28">
          <Container className="grid gap-10 lg:grid-cols-2">
            <div className="relative rounded-[32px] bg-forest-900 p-8 text-paper sm:p-10">
              <Eyebrow tone="paper">Ideal for you if</Eyebrow>
              <ul className="mt-6 flex flex-col gap-5">
                {c.idealFor.map((p) => (
                  <li key={p} className="flex items-start gap-3 font-serif text-[22px] leading-snug">
                    <Check className="mt-1.5 h-5 w-5 shrink-0 text-gold-400" strokeWidth={3} aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
              <Note className="absolute -top-4 right-6 rotate-3 rounded-md bg-butter px-3 py-1.5 text-ink-900">sounds like you?</Note>
            </div>
            <div className="flex flex-col gap-3">
              <Eyebrow className="mb-3">Questions</Eyebrow>
              {c.faqs.map((f) => (
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

        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
