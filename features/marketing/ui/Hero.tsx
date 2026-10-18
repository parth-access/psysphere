import Link from 'next/link';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { Container } from './Container';
import { H1, Body, Eyebrow } from './Typography';
import { Button } from './Button';
import { NAVIGATION } from '@/constants/navigation';
import { listUpcomingWorkshops, formatWorkshopTime } from '@/src/domains/workshops/service';

function ChariotPath() {
  return (
    <svg viewBox="0 0 520 120" className="h-auto w-full" aria-hidden="true">
      <path d="M8 96 C 120 96, 150 24, 260 24 S 420 90, 512 40" fill="none" stroke="#C9CEDB" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 8" />
      <path d="M8 96 C 120 96, 150 24, 260 24" fill="none" stroke="#1C2541" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="8" cy="96" r="6" fill="#1C2541" />
      <circle cx="260" cy="24" r="9" fill="#E3962B" />
      <circle cx="512" cy="40" r="6" fill="#FAF6EF" stroke="#C9CEDB" strokeWidth="2" />
    </svg>
  );
}

export async function Hero() {
  let next: Awaited<ReturnType<typeof listUpcomingWorkshops>>[number] | undefined;
  try {
    [next] = await listUpcomingWorkshops();
  } catch (err) {
    console.error('[hero] could not load workshops', err);
  }

  return (
    <section className="pb-16 pt-32 sm:pb-24 sm:pt-40">
      <Container className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col gap-6">
          <Eyebrow>Psychology · Class 11, Class 12 &amp; CUET-UG</Eyebrow>
          <H1>A calm guide through your psychology exam year.</H1>
          <Body className="max-w-[34rem]">
            Live small-batch classes with Dravina Gupta. Concepts first, then answer-writing, then weekly tests, so
            nothing is left to the night before.
          </Body>
          <div className="flex flex-wrap gap-3">
            <Button href={NAVIGATION.workshops}>Join a free workshop</Button>
            <Button href={NAVIGATION.pricing} variant="outline">
              See fees
            </Button>
          </div>
          <p className="text-sm text-ink-500">Workshops are free and live on Google Meet. Parents are welcome.</p>
        </div>

        <div className="flex flex-col gap-6">
          <ChariotPath />
          <div className="rounded-2xl border border-line bg-surface p-6">
            {next ? (
              <Link href={`/workshops/${next.id}`} className="group flex flex-col gap-3">
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-marigold-700">Next free workshop</p>
                <p className="font-serif text-2xl font-semibold leading-snug text-ink-900">{next.title}</p>
                <p className="flex items-center gap-2 text-[15px] text-ink-500">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  {formatWorkshopTime(next.startsAt, next.endsAt)}
                  {next.seatsLeft !== null && ` · ${next.seatsLeft} seats left`}
                </p>
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink-900">
                  Reserve a free seat <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-marigold-700">Free workshops</p>
                <p className="font-serif text-2xl font-semibold leading-snug text-ink-900">Try a real class before you decide.</p>
                <p className="text-[15px] text-ink-500">New dates are announced regularly. You can also request a seat in a batch directly.</p>
                <Link href={NAVIGATION.join} className="font-semibold text-ink-900 underline underline-offset-4">
                  Join a batch
                </Link>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
