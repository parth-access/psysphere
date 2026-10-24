import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Container } from './Container';
import { H1, Eyebrow } from './Typography';

/** Shared frame for the privacy, refund and terms pages. */
export function LegalPage({
  eyebrow,
  title,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  sections: { heading: string; body: ReactNode }[];
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main id="main" className="flex-1">
        <section className="pb-12 pt-36 sm:pt-44">
          <Container className="flex max-w-3xl flex-col gap-5">
            <Eyebrow>{eyebrow}</Eyebrow>
            <H1 className="lg:!text-[72px]">{title}</H1>
            <p className="text-sm text-ink-500">Last updated {updated}</p>
          </Container>
        </section>
        <section className="pb-24">
          <Container className="max-w-3xl">
            <ol className="flex flex-col gap-4">
              {sections.map((s, i) => (
                <li key={s.heading} className="rounded-[28px] border border-line bg-surface p-7 sm:p-9">
                  <h2 className="mb-3 flex items-baseline gap-3 font-serif text-2xl text-ink-900">
                    <span className="text-forest-800">{i + 1}.</span>
                    {s.heading}
                  </h2>
                  <div className="flex flex-col gap-3 text-[16px] leading-relaxed text-ink-700 [&_a]:font-bold [&_a]:text-forest-800 [&_a]:underline [&_a]:decoration-gold-500 [&_a]:decoration-2 [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
                    {s.body}
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
