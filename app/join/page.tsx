import type { Metadata } from "next";
import { listJoinableBatches } from "@/src/domains/joining/service";
import { PublicShell, Eyebrow } from "@/features/joining/ui/PublicShell";
import { JoinForm } from "@/features/joining/ui/JoinForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join a batch | Saarthi Classes",
  description: "Request a seat in a Saarthi Classes psychology batch for Class 11, Class 12 or CUET.",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const cls = one("class");
  const track = one("track");
  const workshop = one("workshop");

  const batches = await listJoinableBatches();

  return (
    <PublicShell>
      <header className="mb-10 flex max-w-2xl flex-col gap-3">
        <Eyebrow>Join a batch</Eyebrow>
        <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">Get your seat</h1>
        <p className="text-lg text-ink-500">
          Choose your course, plan and batch. Batches are small, so some need Dravina’s approval first.
        </p>
      </header>
      <JoinForm
        batches={batches}
        initialClass={cls === "class_11" || cls === "class_12" ? cls : undefined}
        initialTrack={track === "standard" || track === "cuet" ? track : undefined}
        initialPlan={one("plan")}
        workshopId={workshop && UUID.test(workshop) ? workshop : undefined}
      />
    </PublicShell>
  );
}
