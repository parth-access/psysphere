import Link from 'next/link';
import { CalendarDays, ArrowRight, Video, CheckCircle2 } from 'lucide-react';
import { Container } from './Container';
import { H1, Body, Note } from './Typography';
import { Button } from './Button';
import { Scribble, Arrow, Sparkle } from './Doodles';
import { NAVIGATION } from '@/constants/navigation';
import { listUpcomingWorkshops, formatWorkshopTime } from '@/src/domains/workshops/service';

type Workshop = Awaited<ReturnType<typeof listUpcomingWorkshops>>[number];

function WorkshopCard({ next }: { next?: Workshop }) {
  return (
    <div className="relative rounded-[28px] border border-line bg-surface p-6 shadow-lift sm:p-7">
      <div className="mb-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-forest-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-forest-700" />
          </span>
          {next ? 'Next free workshop' : 'Free workshops'}
        </span>
        <Video className="h-5 w-5 text-ink-500" aria-hidden="true" />
      </div>
      {next ? (
        <Link href={`/workshops/${next.id}`} className="group flex flex-col gap-3">
          <p className="font-serif text-[30px] leading-[1.05] text-ink-900">{next.title}</p>
          <p className="flex items-center gap-2 text-[15px] text-ink-500">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {formatWorkshopTime(next.startsAt, next.endsAt)}
          </p>
          {next.seatsLeft !== null && <p className="text-sm font-semibold text-gold-700">{next.seatsLeft} seats left</p>}
          <span className="mt-2 inline-flex items-center gap-1.5 font-bold text-forest-800">
            Reserve a free seat <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="font-serif text-[30px] leading-[1.05] text-ink-900">Try a real class before you decide.</p>
          <p className="text-[15px] leading-relaxed text-ink-500">
            We post new dates on the workshops page. You can also request a seat in a batch.
          </p>
          <Link href={NAVIGATION.join} className="mt-2 inline-flex items-center gap-1.5 font-bold text-forest-800">
            Join a batch <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}

/** Illustrative only: shows parents what the Sunday report looks like. */
function SampleReport() {
  return (
    <div className="rounded-[24px] border border-line bg-surface p-5 shadow-soft">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">Sample weekly report</p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-mint p-3">
          <p className="text-[11px] font-semibold text-ink-700">Attendance</p>
          <p className="font-serif text-3xl text-ink-900">3/3</p>
        </div>
        <div className="rounded-2xl bg-lilac p-3">
          <p className="text-[11px] font-semibold text-ink-700">Weekly test</p>
          <p className="font-serif text-3xl text-ink-900">17/20</p>
        </div>
      </div>
      <p className="flex items-start gap-2 text-[13px] leading-snug text-ink-700">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" aria-hidden="true" />
        Strong on theories of personality. Revise Erikson’s stages before Friday.
      </p>
    </div>
  );
}

export async function Hero() {
  let next: Workshop | undefined;
  try {
    [next] = await listUpcomingWorkshops();
  } catch (err) {
    console.error('[hero] could not load workshops', err);
  }

  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-mint/70 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 top-1/2 h-[380px] w-[380px] rounded-full bg-butter/70 blur-3xl" aria-hidden="true" />

      <Container className="relative grid items-center gap-16 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col items-start gap-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 py-1.5 pl-1.5 pr-4 text-[13px] font-semibold text-ink-700 backdrop-blur">
            <span className="rounded-full bg-forest-800 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-paper">Live</span>
            Psychology · Class 11, Class 12 &amp; CUET-UG
          </span>

          <H1>
            Psychology that{' '}
            <span className="relative inline-block whitespace-nowrap">
              <em>finally clicks.</em>
              <Scribble className="absolute -bottom-2 left-0 h-4 w-full text-gold-500 sm:-bottom-3 sm:h-5" />
            </span>
          </H1>

          <Body className="max-w-[34rem] text-[18px]">
            Live small-batch classes with psychologist Dravina Gupta. You learn the concept, write a board-style answer,
            and sit a short test each week, so revision stays small.
          </Body>

          <div className="flex flex-wrap items-center gap-3">
            <Button href={NAVIGATION.workshops} className="!min-h-14 !px-7 text-base">
              Join a free workshop <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button href={NAVIGATION.pricing} variant="outline" className="!min-h-14 !px-7 text-base">
              See fees
            </Button>
          </div>

          <div className="flex items-center gap-3 text-sm text-ink-500">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-forest-800" aria-hidden="true">
              <Video className="h-4 w-4" />
            </span>
            Free on Google Meet. Parents are welcome to sit in.
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <Sparkle className="absolute -left-4 top-6 h-7 w-7 animate-float text-gold-500" />

          <div className="relative rotate-[-1.5deg] transition-transform duration-500 hover:rotate-0">
            <WorkshopCard next={next} />
          </div>

          <div className="relative -mt-6 ml-auto w-[82%] rotate-[2deg] sm:-mt-4">
            <SampleReport />
          </div>

          <div className="absolute -bottom-24 -left-4 hidden rotate-[-6deg] rounded-md bg-butter px-5 py-4 shadow-soft sm:block">
            <Note className="text-ink-900">Sent to parents</Note>
            <br />
            <Note className="text-ink-900">every Sunday ✓</Note>
          </div>
          <Arrow className="absolute -bottom-14 left-44 hidden h-12 w-16 -rotate-[40deg] text-gold-700 sm:block" />
        </div>
      </Container>
    </section>
  );
}
