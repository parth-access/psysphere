import { Container } from './Container';
import { H2, Eyebrow } from './Typography';
import { TESTIMONIALS } from '@/constants/testimonials';

/** Hidden until real, permitted testimonials are added in constants/testimonials.ts */
export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <section id="testimonials" className="border-t border-line bg-surface py-20 sm:py-24">
      <Container>
        <Eyebrow className="mb-3">From students</Eyebrow>
        <H2 className="mb-10">In their words</H2>
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex flex-col gap-4 rounded-2xl border border-line p-7">
              <blockquote className="font-serif text-xl leading-snug text-ink-900">“{t.quote}”</blockquote>
              <figcaption className="mt-auto text-[15px]">
                <span className="font-semibold text-ink-900">{t.name}</span>
                <span className="text-ink-500"> · {t.detail}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
