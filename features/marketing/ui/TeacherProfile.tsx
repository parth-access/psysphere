/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';
import { Container } from './Container';
import { H2, Eyebrow, Note } from './Typography';
import { Button } from './Button';
import { DRAVINA_PHOTO } from '@/constants/testimonials';
import { SITE } from '@/constants/site';

export function TeacherProfile() {
  return (
    <section id="teacher" className="py-24 sm:py-32">
      <Container className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[36px] bg-gold-500" aria-hidden="true" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] bg-forest-900">
            {DRAVINA_PHOTO ? (
              <Image src={DRAVINA_PHOTO} alt="Dravina Gupta" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-6" aria-hidden="true">
                <span className="rounded-full bg-paper p-5">
                  <img src={SITE.logoUrl} alt="" width={120} height={120} className="h-28 w-28 object-contain" />
                </span>
                <span className="font-serif text-6xl text-paper">Dravina Gupta</span>
              </div>
            )}
          </div>
          <div className="absolute -right-3 top-8 hidden rotate-6 sm:block">
            <Note className="rounded-md bg-butter px-4 py-2 text-ink-900 shadow-soft">your teacher :)</Note>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Eyebrow>Your teacher</Eyebrow>
          <div>
            <H2>Dravina Gupta</H2>
            <p className="mt-3 text-[15px] font-semibold text-forest-800">Psychologist · Founder of Saarthi</p>
          </div>
          <p className="text-[18px] leading-relaxed text-ink-700">
            I teach psychology because it is the most beautiful subject for understanding ourselves and others. My focus
            is on making difficult theories simple and conceptual, rather than encouraging rote learning.
          </p>
          <figure className="relative rounded-[28px] bg-mint p-7 sm:p-8">
            <span className="absolute -top-6 left-6 font-serif text-[96px] leading-none text-forest-800" aria-hidden="true">
              “
            </span>
            <blockquote className="font-serif text-[28px] italic leading-[1.15] text-ink-900 sm:text-[32px]">
              When students learn with a calm mind, difficult concepts naturally click.
            </blockquote>
          </figure>
          <div className="flex flex-wrap items-center gap-3">
            <Button href="/workshops">Meet her at a free workshop</Button>
            <Button href="/about" variant="ghost">
              About Dravina
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
