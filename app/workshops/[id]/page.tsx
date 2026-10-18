import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, Video, Users } from "lucide-react";
import { getPublicWorkshop, formatWorkshopTime } from "@/src/domains/workshops/service";
import { PublicShell, Eyebrow } from "@/features/joining/ui/PublicShell";
import { WorkshopRegisterForm } from "@/features/joining/ui/WorkshopRegisterForm";
import { CLASS_LABEL } from "@/src/domains/joining/plans";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const w = UUID.test(id) ? await getPublicWorkshop(id) : null;
  return { title: w ? `${w.title} | Free workshop | Saarthi Classes` : "Workshop | Saarthi Classes" };
}

export default async function WorkshopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const w = await getPublicWorkshop(id);
  if (!w) notFound();

  const over = w.endsAt < new Date();
  const full = w.seatsLeft !== null && w.seatsLeft <= 0;

  return (
    <PublicShell>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <section className="flex flex-col gap-5">
          <Eyebrow>Free workshop</Eyebrow>
          <h1 className="font-serif text-4xl font-semibold leading-tight">{w.title}</h1>
          <ul className="flex flex-col gap-3 text-ink-500">
            <li className="flex items-center gap-2"><CalendarDays className="h-5 w-5" aria-hidden="true" />{formatWorkshopTime(w.startsAt, w.endsAt)}</li>
            <li className="flex items-center gap-2"><Video className="h-5 w-5" aria-hidden="true" />Live on Google Meet with Dravina Gupta</li>
            <li className="flex items-center gap-2"><Users className="h-5 w-5" aria-hidden="true" />
              {w.classLevel ? CLASS_LABEL[w.classLevel] : "Class 11 & 12"}
              {w.seatsLeft !== null && !full && ` · ${w.seatsLeft} seats left`}
            </li>
          </ul>
          {w.description && <p className="whitespace-pre-line text-lg leading-relaxed">{w.description}</p>}
          <div className="rounded-2xl border border-line bg-paper-deep p-5 text-[15px] text-ink-500">
            It’s completely free, with no obligation to join. Afterwards we’ll email you how to get a seat
            in a batch if you’d like to continue.
          </div>
        </section>

        <section aria-label="Register">
          {over ? (
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="font-serif text-2xl font-semibold">This workshop has finished</h2>
              <p className="mt-2 text-ink-500">See upcoming workshops, or request a seat in a batch.</p>
            </div>
          ) : full ? (
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="font-serif text-2xl font-semibold">This workshop is full</h2>
              <p className="mt-2 text-ink-500">Please pick another date from the workshops page.</p>
            </div>
          ) : (
            <WorkshopRegisterForm workshopId={w.id} defaultClass={w.classLevel ?? undefined} />
          )}
        </section>
      </div>
    </PublicShell>
  );
}
