import Image from 'next/image';
import { Container } from './Container';
import { H2, Eyebrow } from './Typography';
import { Button } from './Button';
import { DRAVINA_PHOTO } from '@/constants/testimonials';

export function TeacherProfile() {
  return (
    <section id="teacher" className="py-20 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[20px] bg-ink-100">
          {DRAVINA_PHOTO ? (
            <Image src={DRAVINA_PHOTO} alt="Dravina Gupta" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-serif text-[120px] font-semibold text-ink-300" aria-hidden="true">
              DG
            </div>
          )}
        </div>
        <div className="flex flex-col gap-5">
          <Eyebrow>Your teacher</Eyebrow>
          <H2>Dravina Gupta</H2>
          <p className="text-[15px] font-medium text-ink-500">Psychologist · Founder of Saarthi</p>
          <p className="text-[17px] leading-relaxed text-ink-900">
            I teach psychology because it is the most beautiful subject for understanding ourselves and others. My focus
            is on making difficult theories simple and conceptual, rather than encouraging rote learning.
          </p>
          <blockquote className="rounded-2xl border border-line bg-surface p-6 font-serif text-[22px] leading-snug text-ink-900">
            “When students learn with a calm mind, difficult concepts naturally click.”
          </blockquote>
          <div className="flex flex-wrap gap-3">
            <Button href="/workshops">Meet her at a free workshop</Button>
            <Button href="/about" variant="ghost">Read more</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
