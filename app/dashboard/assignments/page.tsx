import Link from "next/link";
import { and, desc, eq, inArray, count } from "drizzle-orm";
import { db } from "@/db";
import { assignments } from "@/db/schema/academic/assignments";
import { assignmentAttempts } from "@/db/schema/academic/assignmentAttempts";
import { batches } from "@/db/schema/core/batches";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { visibleBatchIds } from "@/server/authorization/access";
import { formatIST } from "@/lib/ids";
import { createAssignmentAction } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full min-h-11 px-4 border border-line rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/25 focus:border-ink-700";
const label = "text-xs font-semibold text-ink-500 uppercase tracking-wider block mb-1";

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
    ? new Set((await db.select({ id: assignmentAttempts.assignmentId }).from(assignmentAttempts)
        .where(and(eq(assignmentAttempts.studentProfileId, me.id), inArray(assignmentAttempts.assignmentId, attemptIds)))).map((r) => r.id))
    : new Set<string>();
  const submissionCounts = !isStudent && attemptIds.length
    ? Object.fromEntries((await db.select({ id: assignmentAttempts.assignmentId, n: count() }).from(assignmentAttempts)
        .where(inArray(assignmentAttempts.assignmentId, attemptIds)).groupBy(assignmentAttempts.assignmentId)).map((r) => [r.id, Number(r.n)]))
    : {};

  const myBatches = isStudent || none ? [] : await db
    .select({ id: batches.id, name: batches.name })
    .from(batches)
    .where(ids === "all" ? eq(batches.isActive, true) : and(eq(batches.isActive, true), inArray(batches.id, ids)));

  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader title="Assignments" description={isStudent ? "Your homework and tests, with marks once they’re out." : "Set work, read submissions and give marks."} />
      <div className={`grid gap-8 ${isStudent ? "" : "lg:grid-cols-3"}`}>
        <div className={isStudent ? "" : "lg:col-span-2"}>
          <DashboardCard>
            {list.length === 0 ? (
              <p className="text-sm text-ink-500">No assignments yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {list.map(({ a, batchName }) => {
                  const overdue = a.dueAt < now;
                  const done = myAttempts.has(a.id);
                  const badge = isStudent
                    ? a.resultsPublishedAt ? ["Results out", "bg-ink-100 text-ink-700"] : done ? ["Submitted", "bg-sage-100 text-sage-600"] : overdue ? ["Missed", "bg-rose-100 text-rose-600"] : ["To do", "bg-marigold-100 text-gold-700"]
                    : a.resultsPublishedAt ? ["Results out", "bg-ink-100 text-ink-700"] : [`${submissionCounts[a.id] ?? 0} submitted`, "bg-paper-deep text-ink-700"];
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
              <form action={createAssignmentAction} className="space-y-4">
                <div><label htmlFor="batchId" className={label}>Batch</label>
                  <select id="batchId" name="batchId" required className={input}>{myBatches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                <div><label htmlFor="title" className={label}>Title</label><input id="title" name="title" required className={input} /></div>
                <div><label htmlFor="instructions" className={label}>Instructions</label><textarea id="instructions" name="instructions" rows={5} required className={`${input} py-3`} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label htmlFor="dueDate" className={label}>Due date</label><input id="dueDate" type="date" name="dueDate" required className={input} /></div>
                  <div><label htmlFor="dueTime" className={label}>Time</label><input id="dueTime" type="time" name="dueTime" defaultValue="21:00" required className={input} /></div>
                </div>
                <div><label htmlFor="maxMarks" className={label}>Out of (marks)</label><input id="maxMarks" type="number" name="maxMarks" min={1} defaultValue={20} required className={input} /></div>
                <button type="submit" className="w-full min-h-11 rounded-full bg-forest-800 text-sm font-semibold text-paper hover:bg-forest-900">Create and share</button>
              </form>
            )}
          </DashboardCard>
        )}
      </div>
    </div>
  );
}
