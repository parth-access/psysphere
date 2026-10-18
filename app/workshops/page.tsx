import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, Users } from "lucide-react";
import { listUpcomingWorkshops, formatWorkshopTime } from "@/src/domains/workshops/service";
import { PublicShell, Eyebrow } from "@/features/joining/ui/PublicShell";
import { CLASS_LABEL } from "@/src/domains/joining/plans";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free workshops | Saarthi Classes",
  description: "Free live psychology workshops with Dravina Gupta for Class 11 and 12 students.",
};

export default async function WorkshopsPage() {
  const workshops = await listUpcomingWorkshops();

  return (
    <PublicShell>
      <header className="mb-12 flex max-w-2xl flex-col gap-4">
        <Eyebrow>Free · Live on Google Meet</Eyebrow>
        <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
          Try a class with Dravina, free.
        </h1>
        <p className="text-lg text-ink-500">
          Each workshop is a real lesson on one psychology topic. Come, learn something useful for
          your exams, and decide afterwards whether you want to join a batch.
        </p>
      </header>

      {workshops.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-8">
          <h2 className="font-serif text-2xl font-semibold">No workshops scheduled right now</h2>
          <p className="mt-2 text-ink-500">
            New dates are announced regularly. You can still{" "}
            <Link href="/join" className="font-semibold underline underline-offset-4">
              request a seat in a batch
            </Link>{" "}
            directly.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {workshops.map((w) => {
            const full = w.seatsLeft !== null && w.seatsLeft <= 0;
            return (
              <li key={w.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
                <div className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  <span>{formatWorkshopTime(w.startsAt, w.endsAt)}</span>
                </div>
                <h2 className="font-serif text-2xl font-semibold leading-snug">{w.title}</h2>
                {w.description && <p className="line-clamp-3 text-ink-500">{w.description}</p>}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="inline-flex items-center gap-1.5 text-sm text-ink-500">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    {w.classLevel ? CLASS_LABEL[w.classLevel] : "Class 11 & 12"}
                    {w.seatsLeft !== null && ` · ${full ? "Full" : `${w.seatsLeft} seats left`}`}
                  </span>
                  <Link
                    href={`/workshops/${w.id}`}
                    className="inline-flex min-h-11 items-center rounded-xl bg-ink-900 px-5 font-semibold text-paper hover:bg-ink-700"
                  >
                    {full ? "View" : "Reserve a seat"}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PublicShell>
  );
}
