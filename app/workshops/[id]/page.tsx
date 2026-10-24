import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicWorkshop } from "@/src/domains/workshops/service";
import { PublicShell } from "@/features/joining/ui/PublicShell";
import { WorkshopDetailView } from "@/features/joining/ui/WorkshopViews";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const w = isUuid(id) ? await getPublicWorkshop(id) : null;
  return { title: w ? `${w.title} | Free workshop | Saarthi Classes` : "Workshop | Saarthi Classes" };
}

export default async function WorkshopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const w = await getPublicWorkshop(id);
  if (!w) notFound();
  return (
    <PublicShell>
      <WorkshopDetailView w={w} />
    </PublicShell>
  );
}
