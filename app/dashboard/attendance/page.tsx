import Link from "next/link";
import { and, desc, eq, inArray, lt, count } from "drizzle-orm";
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

export default async function AttendancePage() {
  const profile = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER]);
  const ids = await visibleBatchIds(profile);

  // Classes that have started (attendance is taken during or after class), newest first
  const cutoff = new Date();
  cutoff.setMinutes(cutoff.getMinutes() + 15);
  const startedFilter = lt(classSessions.startsAt, cutoff);
  const sessions = ids !== "all" && ids.length === 0 ? [] : await db
    .select({ s: classSessions, batchName: batches.name })
    .from(classSessions)
    .innerJoin(batches, eq(batches.id, classSessions.batchId))
    .where(ids === "all" ? startedFilter : and(startedFilter, inArray(classSessions.batchId, ids)))
    .orderBy(desc(classSessions.startsAt))
    .limit(60);

  const marked = sessions.length
    ? Object.fromEntries(
        (await db
          .select({ sessionId: attendance.sessionId, n: count() })
          .from(attendance)
          .where(inArray(attendance.sessionId, sessions.map((x) => x.s.id)))
          .groupBy(attendance.sessionId)).map((r) => [r.sessionId, Number(r.n)])
      )
    : {};

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Mark who joined each class. Students and parents see it in their reports." />
      <DashboardCard>
        {sessions.length === 0 ? (
          <p className="text-sm text-ink-500">No classes have happened yet. Schedule one under Classes.</p>
        ) : (
          <ul className="divide-y divide-line">
            {sessions.map(({ s, batchName }) => {
              const done = (marked[s.id] ?? 0) > 0;
              return (
                <li key={s.id}>
                  <Link href={`/dashboard/attendance/${s.id}`} className="-mx-2 flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-4 hover:bg-paper">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900">{s.title}</p>
                      <p className="text-sm text-ink-500">{batchName} · {formatIST(s.startsAt)}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${done ? "bg-sage-100 text-sage-600" : "bg-marigold-100 text-marigold-700"}`}>
                      {done ? `Marked (${marked[s.id]})` : "Not marked"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </DashboardCard>
    </div>
  );
}
