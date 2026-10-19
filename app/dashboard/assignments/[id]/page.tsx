import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { assignments } from "@/db/schema/academic/assignments";
import { assignmentAttempts } from "@/db/schema/academic/assignmentAttempts";
import { evaluations } from "@/db/schema/academic/evaluations";
import { batches } from "@/db/schema/core/batches";
import { enrollments } from "@/db/schema/core/enrollments";
import { profiles } from "@/db/schema/core/profiles";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { canAccessBatch, canManageBatch } from "@/server/authorization/access";
import { isUuid, formatIST } from "@/lib/ids";
import { submitAssignmentAction, gradeAction, publishResultsAction } from "../actions";

export const dynamic = "force-dynamic";

const input = "w-full min-h-11 px-4 border border-line rounded-xl text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/25 focus:border-ink-700";

export default async function AssignmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const me = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);
  const { id } = await params;
  const { submitted } = await searchParams;
  if (!isUuid(id)) notFound();

  const [row] = await db
    .select({ a: assignments, batchName: batches.name })
    .from(assignments)
    .innerJoin(batches, eq(batches.id, assignments.batchId))
    .where(eq(assignments.id, id));
  if (!row || !(await canAccessBatch(me, row.a.batchId))) notFound();
  const { a } = row;
  const max = Number(a.maxMarks);

  const header = (
    <>
      <Link href="/dashboard/assignments" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All assignments
      </Link>
      <div>
        <h1 className="font-serif text-[32px] font-semibold text-ink-900">{a.title}</h1>
        <p className="text-ink-500">{row.batchName} · due {formatIST(a.dueAt)} · out of {max}</p>
      </div>
      <DashboardCard title="Instructions">
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-900">{a.instructions}</p>
      </DashboardCard>
    </>
  );

  /* ---------------- Student view ---------------- */
  if (me.role === "student") {
    const [mine] = await db
      .select({ attempt: assignmentAttempts, ev: evaluations })
      .from(assignmentAttempts)
      .leftJoin(evaluations, eq(evaluations.assignmentAttemptId, assignmentAttempts.id))
      .where(and(eq(assignmentAttempts.assignmentId, a.id), eq(assignmentAttempts.studentProfileId, me.id)))
      .limit(1);
    const closed = !!a.resultsPublishedAt;
    return (
      <div className="space-y-6">
        {header}
        {submitted && <p role="status" className="rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-600">Submitted. You can edit it until results are out.</p>}
        {closed && mine?.ev && (
          <DashboardCard title="Your result">
            <p className="font-serif text-4xl font-semibold text-ink-900">{Number(mine.ev.marksObtained)} <span className="text-xl text-ink-500">/ {max}</span></p>
            {mine.ev.teacherFeedback && <p className="mt-4 whitespace-pre-line text-[15px] text-ink-900">{mine.ev.teacherFeedback}</p>}
          </DashboardCard>
        )}
        <DashboardCard title={mine ? "Your answer" : "Submit your answer"}>
          {closed ? (
            <p className="whitespace-pre-line text-[15px] text-ink-900">{mine?.attempt.submissionContent ?? "You didn’t submit this one."}</p>
          ) : (
            <form action={submitAssignmentAction} className="space-y-4">
              <input type="hidden" name="assignmentId" value={a.id} />
              <label htmlFor="content" className="sr-only">Your answer</label>
              <textarea id="content" name="content" rows={10} required defaultValue={mine?.attempt.submissionContent ?? ""} className={`${input} py-3`} />
              <div>
                <label htmlFor="attachmentUrl" className="mb-1 block text-sm font-semibold text-ink-900">Link to a photo or document (optional)</label>
                <input id="attachmentUrl" name="attachmentUrl" type="url" placeholder="https://drive.google.com/…" defaultValue={mine?.attempt.attachmentUrl ?? ""} className={input} />
              </div>
              <button type="submit" className="min-h-11 rounded-xl bg-ink-900 px-6 text-sm font-semibold text-paper hover:bg-ink-700">
                {mine ? "Update submission" : "Submit"}
              </button>
              {a.dueAt < new Date() && <p className="text-sm text-marigold-700">This is past the due date. It will be marked as late.</p>}
            </form>
          )}
        </DashboardCard>
      </div>
    );
  }

  /* ---------------- Teacher / admin view ---------------- */
  const canManage = await canManageBatch(me, a.batchId);
  const roster = await db
    .select({ id: profiles.id, name: profiles.fullName })
    .from(enrollments)
    .innerJoin(profiles, eq(profiles.id, enrollments.studentProfileId))
    .where(and(eq(enrollments.batchId, a.batchId), eq(enrollments.status, "active")))
    .orderBy(profiles.fullName);
  const attempts = await db
    .select({ attempt: assignmentAttempts, ev: evaluations })
    .from(assignmentAttempts)
    .leftJoin(evaluations, eq(evaluations.assignmentAttemptId, assignmentAttempts.id))
    .where(eq(assignmentAttempts.assignmentId, a.id));
  const byStudent = new Map(attempts.map((x) => [x.attempt.studentProfileId, x]));
  const graded = attempts.filter((x) => x.ev?.marksObtained != null).length;

  return (
    <div className="space-y-6">
      {header}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-ink-500">{attempts.length} of {roster.length} submitted · {graded} marked</p>
        {canManage && (
          <form action={publishResultsAction}>
            <input type="hidden" name="id" value={a.id} />
            <button type="submit" className={`min-h-11 rounded-xl px-5 text-sm font-semibold ${a.resultsPublishedAt ? "border border-line text-ink-900 hover:bg-paper" : "bg-marigold-500 text-ink-900 hover:bg-marigold-100"}`}>
              {a.resultsPublishedAt ? "Hide results from students" : "Publish results to students"}
            </button>
          </form>
        )}
      </div>
      <DashboardCard title="Submissions">
        <ul className="divide-y divide-line">
          {roster.map((st) => {
            const x = byStudent.get(st.id);
            return (
              <li key={st.id} className="space-y-3 py-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink-900">{st.name}</p>
                  <p className="text-sm text-ink-500">
                    {x?.attempt.submittedAt ? `Submitted ${formatIST(x.attempt.submittedAt)}${x.attempt.submittedAt > a.dueAt ? " · late" : ""}` : "Not submitted"}
                  </p>
                </div>
                {x && (
                  <>
                    <p className="whitespace-pre-line rounded-xl bg-paper p-4 text-[15px] text-ink-900">{x.attempt.submissionContent}</p>
                    {x.attempt.attachmentUrl && (
                      <a href={x.attempt.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-ink-900 underline">Open attachment</a>
                    )}
                    {canManage && (
                      <form action={gradeAction} className="flex flex-wrap items-end gap-3">
                        <input type="hidden" name="attemptId" value={x.attempt.id} />
                        <div>
                          <label htmlFor={`m-${x.attempt.id}`} className="mb-1 block text-xs font-semibold text-ink-500">Marks / {max}</label>
                          <input id={`m-${x.attempt.id}`} name="marks" type="number" step="0.5" min={0} max={max} required defaultValue={x.ev?.marksObtained ? Number(x.ev.marksObtained) : undefined} className={`${input} w-28`} />
                        </div>
                        <div className="min-w-60 flex-1">
                          <label htmlFor={`f-${x.attempt.id}`} className="mb-1 block text-xs font-semibold text-ink-500">Feedback</label>
                          <input id={`f-${x.attempt.id}`} name="feedback" defaultValue={x.ev?.teacherFeedback ?? ""} className={input} />
                        </div>
                        <button type="submit" className="min-h-11 rounded-xl bg-ink-900 px-5 text-sm font-semibold text-paper hover:bg-ink-700">
                          {x.ev ? "Update" : "Save marks"}
                        </button>
                      </form>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </DashboardCard>
    </div>
  );
}
