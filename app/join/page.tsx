import type { Metadata } from "next";
import { listJoinableBatches } from "@/src/domains/joining/service";
import { PublicShell } from "@/features/joining/ui/PublicShell";
import { JoinView } from "@/features/joining/ui/JoinView";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join a batch | Saarthi Classes",
  description: "Request a seat in a Saarthi Classes psychology batch for Class 11, Class 12 or CUET.",
};

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
      <JoinView
        batches={batches}
        initialClass={cls === "class_11" || cls === "class_12" ? cls : undefined}
        initialTrack={track === "standard" || track === "cuet" ? track : undefined}
        initialPlan={one("plan")}
        workshopId={workshop && isUuid(workshop) ? workshop : undefined}
      />
    </PublicShell>
  );
}
