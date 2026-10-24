import type { Metadata } from "next";
import { listUpcomingWorkshops } from "@/src/domains/workshops/service";
import { PublicShell } from "@/features/joining/ui/PublicShell";
import { WorkshopListView } from "@/features/joining/ui/WorkshopViews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free workshops | Saarthi Classes",
  description: "Free live psychology workshops with Dravina Gupta for Class 11 and 12 students.",
};

export default async function WorkshopsPage() {
  const workshops = await listUpcomingWorkshops();
  return (
    <PublicShell>
      <WorkshopListView workshops={workshops} />
    </PublicShell>
  );
}
