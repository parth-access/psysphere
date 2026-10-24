import { Container } from './Container';
import { H2, Eyebrow } from './Typography';
import { TESTIMONIALS } from '@/constants/testimonials';

const tints = ['bg-mint', 'bg-lilac', 'bg-peach', 'bg-sky', 'bg-butter'];

/** Hidden until real, permitted testimonials are added in constants/testimonials.ts */
export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <section id="testimonials" className="bg-paper-deep py-24 sm:py-32">
      <Container>
        <div className="mb-12 flex flex-col gap-4">
          <Eyebrow>From students</Eyebrow>
          <H2>
            In their <em>own words.</em>
          </H2>
        </div>
        <div className="columns-1 gap-5 md:columns-2 lg:columns-3">
          {TESTIMONIALS.map((t, i) => (
            <figure key={t.name} className={`mb-5 flex break-inside-avoid flex-col gap-6 rounded-[28px] p-7 ${tints[i % tints.length]}`}>
              <blockquote className="font-serif text-[24px] leading-[1.2] text-ink-900">“{t.quote}”</blockquote>
              <figcaption className="text-[15px]">
                <span className="font-bold text-ink-900">{t.name}</span>
                <span className="text-ink-700"> · {t.detail}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
