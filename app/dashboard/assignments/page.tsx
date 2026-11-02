import Link from "next/link";
import { and, desc, eq, inArray, count } from "drizzle-orm";
import { db } from "@/db";
import { assignments } from "@/db/schema/academic/assignments";
import { assignmentAttempts } from "@/db/schema/academic/assignmentAttempts";
import { evaluations } from "@/db/schema/academic/evaluations";
import { batches } from "@/db/schema/core/batches";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { visibleBatchIds } from "@/server/authorization/access";
import { formatIST } from "@/lib/ids";
import { STATUS_STYLE, studentStatus } from "@/src/domains/assignments/status";
import { AssignmentForm } from "@/features/assignments/ui/AssignmentForm";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const me = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);
  const ids = await visibleBatchIds(me);
  const isStudent = me.role === "student";
  const none = ids !== "all" && ids.length === 0;

  const list = none ? [] : await db
    .select({ a: assignments, batchName: batches.name })
    .from(assignments)
    .innerJoin(batches, eq(batches.id, assignments.batchId))
    .where(ids === "all" ? undefined : inArray(assignments.batchId, ids))
    .orderBy(desc(assignments.dueAt))
    .limit(100);

  const attemptIds = list.map((x) => x.a.id);
  const myAttempts = isStudent && attemptIds.length
    ? new Map((await db.select({ id: assignmentAttempts.assignmentId, submittedAt: assignmentAttempts.submittedAt, evaluationId: evaluations.id })
        .from(assignmentAttempts)
        .leftJoin(evaluations, eq(evaluations.assignmentAttemptId, assignmentAttempts.id))
        .where(and(eq(assignmentAttempts.studentProfileId, me.id), inArray(assignmentAttempts.assignmentId, attemptIds)))).map((r) => [r.id, r]))
    : new Map<string, { submittedAt: Date | null; evaluationId: string | null }>();
  const submissionCounts = !isStudent && attemptIds.length
    ? Object.fromEntries((await db.select({ id: assignmentAttempts.assignmentId, n: count(), checked: count(evaluations.id) })
        .from(assignmentAttempts)
        .leftJoin(evaluations, eq(evaluations.assignmentAttemptId, assignmentAttempts.id))
        .where(inArray(assignmentAttempts.assignmentId, attemptIds)).groupBy(assignmentAttempts.assignmentId)).map((r) => [r.id, { n: Number(r.n), toCheck: Number(r.n) - Number(r.checked) }]))
    : {};

  const myBatches = isStudent || none ? [] : await db
    .select({ id: batches.id, name: batches.name })
    .from(batches)
    .where(ids === "all" ? eq(batches.isActive, true) : and(eq(batches.isActive, true), inArray(batches.id, ids)));

  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader title="Assignments" description={isStudent ? "Your homework, with marks once they’re out." : "Set work, read answers and give marks."} />
      <div className={`grid gap-8 ${isStudent ? "" : "lg:grid-cols-3"}`}>
        <div className={isStudent ? "" : "lg:col-span-2"}>
          <DashboardCard>
            {list.length === 0 ? (
              <p className="text-sm text-ink-500">No assignments yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {list.map(({ a, batchName }) => {
                  const mine = myAttempts.get(a.id);
                  const status = studentStatus(a, mine, !!mine?.evaluationId, now);
                  const counts = submissionCounts[a.id];
                  const badge = isStudent
                    ? [status, STATUS_STYLE[status]]
                    : a.resultsPublishedAt ? ["Results out", "bg-ink-100 text-ink-700"]
                    : counts?.toCheck ? [`${counts.toCheck} to check`, "bg-marigold-100 text-gold-700"]
                    : [`${counts?.n ?? 0} submitted`, "bg-paper-deep text-ink-700"];
                  return (
                    <li key={a.id}>
                      <Link href={`/dashboard/assignments/${a.id}`} className="-mx-2 flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-4 hover:bg-paper">
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-900">{a.title}</p>
                          <p className="text-sm text-ink-500">{batchName} · due {formatIST(a.dueAt)} · {Number(a.maxMarks)} marks</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge[1]}`}>{badge[0]}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </DashboardCard>
        </div>

        {!isStudent && (
          <DashboardCard title="New assignment">
            {myBatches.length === 0 ? (
              <p className="text-sm text-ink-500">You need a batch first.</p>
            ) : (
              <AssignmentForm batches={myBatches} />
            )}
          </DashboardCard>
        )}
      </div>
    </div>
  );
}
