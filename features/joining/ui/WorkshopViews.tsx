import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Users, Video } from "lucide-react";
import { formatWorkshopTime } from "@/src/domains/workshops/service";
import { CLASS_LABEL, type ClassLevel } from "@/src/domains/joining/plans";
import { Eyebrow } from "@/features/marketing/ui/Typography";
import { DateTile, JoinPaths } from "./JoinPaths";
import { WorkshopRegisterForm } from "./WorkshopRegisterForm";

export type PublicWorkshop = {
  id: string;
  title: string;
  description: string | null;
  classLevel: ClassLevel | null;
  startsAt: Date;
  endsAt: Date;
  seatsLeft: number | null;
};

const audience = (w: PublicWorkshop) => (w.classLevel ? CLASS_LABEL[w.classLevel] : "Class 11 & 12");
const minutes = (w: PublicWorkshop) => Math.round((w.endsAt.getTime() - w.startsAt.getTime()) / 60_000);

export function WorkshopListView({ workshops }: { workshops: PublicWorkshop[] }) {
  return (
    <div className="flex flex-col gap-14">
      <header className="flex max-w-2xl flex-col gap-4">
        <Eyebrow>Free · Live on Google Meet</Eyebrow>
        <h1 className="font-serif text-[44px] leading-[1] sm:text-[64px]">
          Try a class with Dravina, <em className="text-forest-800">free.</em>
        </h1>
        <p className="text-lg text-ink-500">
          Each workshop is a real lesson on one psychology topic. Learn something useful for your exams, then decide
          whether you want to join a batch.
        </p>
      </header>

      <section aria-labelledby="upcoming-title" className="flex flex-col gap-5">
        <h2 id="upcoming-title" className="font-serif text-3xl">
          Upcoming workshops
        </h2>
        {workshops.length === 0 ? (
          <div className="rounded-[28px] border border-line bg-surface p-8 sm:p-10">
            <p className="font-serif text-2xl">No workshops scheduled right now</p>
            <p className="mt-2 text-ink-500">
              We post new dates here. In the meantime you can{" "}
              <Link href="/join" className="font-bold text-forest-800 underline decoration-gold-500 decoration-2 underline-offset-4">
                join a batch directly
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {workshops.map((w) => {
              const full = w.seatsLeft !== null && w.seatsLeft <= 0;
              const few = !full && w.seatsLeft !== null && w.seatsLeft <= 5;
              return (
                <li key={w.id}>
                  <Link
                    href={`/workshops/${w.id}`}
                    className="group flex h-full gap-5 rounded-[28px] border border-line bg-surface p-6 transition-shadow hover:shadow-lift sm:p-7"
                  >
                    <DateTile date={w.startsAt} />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <p className="text-sm text-ink-500">{formatWorkshopTime(w.startsAt, w.endsAt)}</p>
                      <h3 className="font-serif text-[26px] leading-[1.1] text-ink-900">{w.title}</h3>
                      {w.description && <p className="line-clamp-2 text-[15px] text-ink-500">{w.description}</p>}
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                        <span className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="rounded-full bg-forest-50 px-2.5 py-0.5 font-semibold text-forest-800">{audience(w)}</span>
                          {full ? (
                            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-semibold text-rose-600">Full</span>
                          ) : few ? (
                            <span className="rounded-full bg-butter px-2.5 py-0.5 font-semibold text-gold-700">{w.seatsLeft} seats left</span>
                          ) : w.seatsLeft !== null ? (
                            <span className="text-ink-500">{w.seatsLeft} seats left</span>
                          ) : null}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-forest-800">
                          {full ? "View" : "Reserve a seat"}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <JoinPaths current="workshop" />
    </div>
  );
}

const AFTER_STEPS = [
  { title: "Reserve your seat", desc: "Fill in the form. It takes a minute." },
  { title: "Get the Meet link", desc: "We email you the Google Meet link for the class." },
  { title: "Join a batch, if you want", desc: "After the workshop we email you a link to request a seat." },
];

export function WorkshopDetailView({ w, now = new Date() }: { w: PublicWorkshop; now?: Date }) {
  const over = w.endsAt < now;
  const full = w.seatsLeft !== null && w.seatsLeft <= 0;

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr]">
      <section className="flex flex-col gap-7">
        <Link href="/workshops" className="text-sm font-semibold text-ink-500 hover:text-ink-900">
          ← All workshops
        </Link>
        <div className="flex items-start gap-5">
          <DateTile date={w.startsAt} />
          <div className="flex flex-col gap-2">
            <Eyebrow>Free workshop</Eyebrow>
            <h1 className="font-serif text-[40px] leading-[1.02] sm:text-[52px]">{w.title}</h1>
          </div>
        </div>

        <ul className="grid gap-3 rounded-[24px] border border-line bg-surface p-5 text-[15px] text-ink-700 sm:grid-cols-2">
          <li className="flex items-center gap-2.5">
            <CalendarDays className="h-5 w-5 shrink-0 text-forest-800" aria-hidden="true" />
            {formatWorkshopTime(w.startsAt, w.endsAt)}
          </li>
          <li className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 shrink-0 text-forest-800" aria-hidden="true" />
            {minutes(w)} minutes
          </li>
          <li className="flex items-center gap-2.5">
            <Video className="h-5 w-5 shrink-0 text-forest-800" aria-hidden="true" />
            Live on Google Meet with Dravina
          </li>
          <li className="flex items-center gap-2.5">
            <Users className="h-5 w-5 shrink-0 text-forest-800" aria-hidden="true" />
            {audience(w)}
            {w.seatsLeft !== null && !full && ` · ${w.seatsLeft} seats left`}
          </li>
        </ul>

        {w.description && <p className="whitespace-pre-line text-[18px] leading-relaxed text-ink-700">{w.description}</p>}

        <div className="rounded-[28px] bg-paper-deep p-6 sm:p-7">
          <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.14em] text-forest-800">How it works</h2>
          <ol className="flex flex-col gap-4">
            {AFTER_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface font-bold text-forest-800 shadow-soft">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-semibold text-ink-900">{s.title}</span>
                  <span className="block text-[15px] text-ink-500">{s.desc}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-t border-line pt-4 text-sm text-ink-500">
            The workshop is free and there’s nothing to pay. Parents are welcome to sit in.
          </p>
        </div>
      </section>

      <section aria-label="Register" className="lg:sticky lg:top-28 lg:self-start">
        {over || full ? (
          <div className="flex flex-col gap-3 rounded-[28px] border border-line bg-surface p-7 sm:p-8">
            <h2 className="font-serif text-3xl">{over ? "This workshop has finished" : "This workshop is full"}</h2>
            <p className="text-ink-500">
              {over ? "See what’s coming up next, or join a batch directly." : "Pick another date, or join a batch directly."}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href="/workshops" className="inline-flex min-h-11 items-center rounded-full bg-forest-800 px-5 font-bold text-paper hover:bg-forest-900">
                Upcoming workshops
              </Link>
              <Link href="/join" className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-ink-900 px-5 font-bold text-ink-900 hover:bg-ink-100">
                Join a batch
              </Link>
            </div>
          </div>
        ) : (
          <WorkshopRegisterForm workshopId={w.id} defaultClass={w.classLevel ?? undefined} when={formatWorkshopTime(w.startsAt, w.endsAt)} />
        )}
      </section>
    </div>
  );
}
