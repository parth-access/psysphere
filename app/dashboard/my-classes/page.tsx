import { and, asc, desc, eq, gt, inArray, lte } from "drizzle-orm";
import { Video } from "lucide-react";
import { db } from "@/db";
import { classSessions } from "@/db/schema/academic/classSessions";
import { attendance } from "@/db/schema/academic/attendance";
import { batches } from "@/db/schema/core/batches";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { visibleBatchIds } from "@/server/authorization/access";
import { formatIST } from "@/lib/ids";

export const dynamic = "force-dynamic";

const ATT: Record<string, [string, string]> = {
  present: ["Present", "bg-sage-100 text-sage-600"],
  absent: ["Absent", "bg-rose-100 text-rose-600"],
  excused: ["Excused", "bg-paper-deep text-ink-700"],
};

export default async function MyClassesPage() {
  const me = await enforcePageRole([ROLES.STUDENT]);
  const ids = await visibleBatchIds(me);
  const batchIds = ids === "all" ? [] : ids;
  const now = new Date();
  const soon = new Date(now.getTime() - 90 * 60_000); // keep a class "upcoming" until 90 min after start

  if (batchIds.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="My classes" />
        <DashboardCard><p className="text-sm text-ink-500">You’re not in a batch yet.</p></DashboardCard>
      </div>
    );
  }

  const base = db
    .select({ s: classSessions, batchName: batches.name })
    .from(classSessions)
    .innerJoin(batches, eq(batches.id, classSessions.batchId));
  const upcoming = await base.where(and(inArray(classSessions.batchId, batchIds), gt(classSessions.startsAt, soon))).orderBy(asc(classSessions.startsAt)).limit(20);
  const past = await db
    .select({ s: classSessions, batchName: batches.name })
    .from(classSessions)
    .innerJoin(batches, eq(batches.id, classSessions.batchId))
    .where(and(inArray(classSessions.batchId, batchIds), lte(classSessions.startsAt, soon)))
    .orderBy(desc(classSessions.startsAt))
    .limit(40);
  const att = Object.fromEntries(
    (await db.select().from(attendance).where(eq(attendance.studentProfileId, me.id))).map((a) => [a.sessionId, a.status])
  );

  return (
    <div className="space-y-6">
      <PageHeader title="My classes" description="Join live classes and see your attendance." />
      <DashboardCard title="Coming up">
        {upcoming.length === 0 ? <p className="text-sm text-ink-500">No classes scheduled yet.</p> : (
          <ul className="divide-y divide-line">
            {upcoming.map(({ s, batchName }) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">{s.title}</p>
                  <p className="text-sm text-ink-500">{s.topicTitle} · {batchName} · {formatIST(s.startsAt)}</p>
                </div>
                {s.status !== "cancelled" ? (
                  <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-semibold text-paper hover:bg-ink-700">
                    <Video className="h-4 w-4" aria-hidden="true" /> Join
                  </a>
                ) : <span className="text-sm font-semibold text-rose-600">Cancelled</span>}
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>
      <DashboardCard title="Past classes">
        {past.length === 0 ? <p className="text-sm text-ink-500">None yet.</p> : (
          <ul className="divide-y divide-line">
            {past.map(({ s, batchName }) => {
              const a = ATT[att[s.id] ?? ""];
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900">{s.title}</p>
                    <p className="text-sm text-ink-500">{batchName} · {formatIST(s.startsAt)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${a ? a[1] : "bg-paper-deep text-ink-500"}`}>{a ? a[0] : "Not marked"}</span>
                </li>
              );
            })}
          </ul>
        )}
      </DashboardCard>
    </div>
  );
}
