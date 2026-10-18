import Link from "next/link";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { CreateWorkshopForm } from "@/features/dashboard/ui/CreateWorkshopForm";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { listAllWorkshops, formatWorkshopTime } from "@/src/domains/workshops/service";

export const dynamic = "force-dynamic";

export default async function WorkshopsAdminPage() {
  await enforcePageRole([ROLES.ADMIN]);
  const rows = await listAllWorkshops();
  const now = new Date();

  return (
    <div className="space-y-8">
      <PageHeader title="Workshops" description="Free classes that bring new students in." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DashboardCard title="All workshops">
            {rows.length === 0 ? (
              <p className="text-sm text-ink-500">No workshops yet. Create your first one.</p>
            ) : (
              <ul className="divide-y divide-line">
                {rows.map(({ workshop: w, registrations }) => {
                  const past = w.endsAt < now;
                  return (
                    <li key={w.id}>
                      <Link href={`/dashboard/workshops/${w.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-paper -mx-2 px-2 rounded-lg">
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-900 truncate">{w.title}</p>
                          <p className="text-sm text-ink-500">{formatWorkshopTime(w.startsAt, w.endsAt)}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-ink-500">{registrations}{w.capacity ? ` / ${w.capacity}` : ""} registered</span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${past ? "bg-paper-deep text-ink-500" : w.isPublished ? "bg-sage-100 text-sage-600" : "bg-marigold-100 text-marigold-700"}`}>
                            {past ? "Done" : w.isPublished ? "Live" : "Hidden"}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </DashboardCard>
        </div>
        <DashboardCard title="New workshop">
          <CreateWorkshopForm />
        </DashboardCard>
      </div>
    </div>
  );
}
