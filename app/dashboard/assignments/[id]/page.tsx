import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, Pencil } from "lucide-react";
import { db } from "@/db";
import { assignments } from "@/db/schema/academic/assignments";
import { assignmentAttempts } from "@/db/schema/academic/assignmentAttempts";
import { evaluations } from "@/db/schema/academic/evaluations";
import { batches } from "@/db/schema/core/batches";
import { enrollments } from "@/db/schema/core/enrollments";
import { profiles } from "@/db/schema/core/profiles";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { AnswerForm } from "@/features/assignments/ui/AnswerForm";
import { FileLink, type FileRef } from "@/features/assignments/ui/FileLink";
import { MarkForm } from "@/features/assignments/ui/MarkForm";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { canAccessBatch, canManageBatch } from "@/server/authorization/access";
import { isUuid, formatIST } from "@/lib/ids";
import { STATUS_STYLE, isClosed, isLate, studentStatus } from "@/src/domains/assignments/status";
import { publishResultsAction, reopenAnswerAction } from "../actions";
import { PendingButton } from "@/features/shared/ui/PendingButton";

export const dynamic = "force-dynamic";

type Attempt = typeof assignmentAttempts.$inferSelect;

const answerFile = (t: Attempt): FileRef | null => (t.filePath ? { kind: "answer", id: t.id, name: t.fileName, bytes: t.fileBytes } : null);
const checkedFile = (t: Attempt, ev: typeof evaluations.$inferSelect | null | undefined): FileRef | null =>
  ev?.checkedFilePath ? { kind: "checked", id: t.id, name: ev.checkedFileName, bytes: ev.checkedFileBytes } : null;

/** Links pasted before uploads existed. Only ever a web address, so a bad one can't run anything when clicked. */
function OldLink({ url }: { url: string | null }) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  return <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-ink-900 underline">Open attachment</a>;
}

const FILTERS = [
  { id: "all", label: "Everyone" },
  { id: "tocheck", label: "To check" },
  { id: "checked", label: "Checked" },
  { id: "late", label: "Late" },
  { id: "missing", label: "Not submitted" },
] as const;

export default async function AssignmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ show?: string }>;
}) {
  const me = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);
  const { id } = await params;
  const { show } = await searchParams;
  if (!isUuid(id)) notFound();

  const [row] = await db
    .select({ a: assignments, batchName: batches.name })
    .from(assignments)
    .innerJoin(batches, eq(batches.id, assignments.batchId))
    .where(eq(assignments.id, id));
  if (!row || !(await canAccessBatch(me, row.a.batchId))) notFound();
  const { a } = row;
  const max = Number(a.maxMarks);
  const now = new Date();
  const canManage = me.role !== "student" && (await canManageBatch(me, a.batchId));

  const header = (
    <>
      <Link href="/dashboard/assignments" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All assignments
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-[32px] text-ink-900">{a.title}</h1>
          <p className="text-ink-500">
            {row.batchName} · due {formatIST(a.dueAt)} · out of {max}
            {!a.allowLate && " · no late work"}
          </p>
        </div>
        {canManage && (
          <Link href={`/dashboard/assignments/${a.id}/edit`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-ink-900 hover:bg-paper">
            <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
          </Link>
        )}
      </div>
      <DashboardCard title="Questions">
        <div className="space-y-4">
          {a.instructions && <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-900">{a.instructions}</p>}
          {a.questionFilePath && <FileLink file={{ kind: "question", id: a.id, name: a.questionFileName, bytes: a.questionFileBytes }} label="Question paper" preview />}
        </div>
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
    const closed = isClosed(a, now);
    const locked = !!mine?.ev && !a.resultsPublishedAt;
    const status = studentStatus(a, mine?.attempt, !!mine?.ev, now);
    const canAnswer = !closed && !mine?.ev;

    return (
      <div className="space-y-6">
        {header}
        <p><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}>{status}</span></p>
        {a.resultsPublishedAt && mine?.ev && (
          <DashboardCard title="Your result">
            <p className="font-serif text-4xl text-ink-900">{Number(mine.ev.marksObtained)} <span className="text-xl text-ink-500">/ {max}</span></p>
            {mine.ev.teacherFeedback && <p className="mt-4 whitespace-pre-line text-[15px] text-ink-900">{mine.ev.teacherFeedback}</p>}
            {checkedFile(mine.attempt, mine.ev) && <div className="mt-4"><FileLink file={checkedFile(mine.attempt, mine.ev)!} label="Checked copy" /></div>}
          </DashboardCard>
        )}
        {locked && (
          <p role="status" className="rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-600">
            Your teacher has checked this, so it can’t be changed now. Your marks will show here when results are published.
          </p>
        )}
        <DashboardCard title={mine ? "Your answer" : canAnswer ? "Submit your answer" : "Your answer"}>
          {canAnswer ? (
            <AnswerForm
              assignmentId={a.id}
              savedText={mine?.attempt.submissionContent ?? ""}
              savedFile={mine ? answerFile(mine.attempt) : null}
              late={a.dueAt < now}
            />
          ) : mine ? (
            <div className="space-y-4">
              {mine.attempt.submissionContent && <p className="whitespace-pre-line text-[15px] text-ink-900">{mine.attempt.submissionContent}</p>}
              {answerFile(mine.attempt) && <FileLink file={answerFile(mine.attempt)!} label="Your file" />}
              <OldLink url={mine.attempt.attachmentUrl} />
              {mine.attempt.submittedAt && <p className="text-sm text-ink-500">Submitted {formatIST(mine.attempt.submittedAt)}{isLate(a, mine.attempt) ? " · late" : ""}</p>}
            </div>
          ) : (
            <p className="text-[15px] text-ink-500">You didn’t submit this one.</p>
          )}
        </DashboardCard>
      </div>
    );
  }

  /* ---------------- Teacher / admin view ---------------- */
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

  const rows = roster.map((st) => ({ st, x: byStudent.get(st.id) }));
  type Row = (typeof rows)[number];
  const matches: Record<(typeof FILTERS)[number]["id"], (r: Row) => boolean> = {
    all: () => true,
    tocheck: (r) => !!r.x && !r.x.ev,
    checked: (r) => !!r.x?.ev,
    late: (r) => isLate(a, r.x?.attempt),
    missing: (r) => !r.x,
  };
  const filter = FILTERS.find((f) => f.id === show)?.id ?? "all";
  const visible = rows.filter(matches[filter]);

  return (
    <div className="space-y-6">
      {header}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter students" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={`/dashboard/assignments/${a.id}${f.id === "all" ? "" : `?show=${f.id}`}`}
              aria-current={filter === f.id ? "true" : undefined}
              className={`inline-flex min-h-9 items-center rounded-full px-3.5 text-sm font-semibold ${filter === f.id ? "bg-forest-800 text-paper" : "bg-paper-deep text-ink-700 hover:text-ink-900"}`}
            >
              {f.label} · {rows.filter(matches[f.id]).length}
            </Link>
          ))}
        </nav>
        {canManage && (
          <form action={publishResultsAction}>
            <input type="hidden" name="id" value={a.id} />
            <PendingButton className={`min-h-11 rounded-xl px-5 text-sm font-semibold ${a.resultsPublishedAt ? "border border-line text-ink-900 hover:bg-paper" : "bg-marigold-500 text-ink-900 hover:bg-marigold-100"}`}>
              {a.resultsPublishedAt ? "Hide results from students" : "Publish results to students"}
            </PendingButton>
          </form>
        )}
      </div>
      <DashboardCard title="Submissions">
        {visible.length === 0 ? (
          <p className="text-sm text-ink-500">{roster.length === 0 ? "No students in this batch yet." : "Nobody here right now."}</p>
        ) : (
          <ul className="divide-y divide-line">
            {visible.map(({ st, x }) => (
              <li key={st.id} className="space-y-3 py-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink-900">{st.name}</p>
                  <p className="text-sm text-ink-500">
                    {x?.attempt.submittedAt ? `Submitted ${formatIST(x.attempt.submittedAt)}${isLate(a, x.attempt) ? " · late" : ""}` : "Not submitted"}
                  </p>
                </div>
                {x && (
                  <>
                    {x.attempt.submissionContent && <p className="whitespace-pre-line rounded-xl bg-paper p-4 text-[15px] text-ink-900">{x.attempt.submissionContent}</p>}
                    {answerFile(x.attempt) && <FileLink file={answerFile(x.attempt)!} label="Answer" preview />}
                    <OldLink url={x.attempt.attachmentUrl} />
                    {canManage && (
                      <MarkForm
                        attemptId={x.attempt.id}
                        max={max}
                        marks={x.ev?.marksObtained != null ? Number(x.ev.marksObtained) : null}
                        feedback={x.ev?.teacherFeedback ?? null}
                        checkedFile={checkedFile(x.attempt, x.ev)}
                      />
                    )}
                    {canManage && x.ev && !a.resultsPublishedAt && (
                      <form action={reopenAnswerAction}>
                        <input type="hidden" name="attemptId" value={x.attempt.id} />
                        <PendingButton className="text-sm font-semibold text-ink-500 underline underline-offset-2 hover:text-ink-900">
                          Clear marks and let them change their answer
                        </PendingButton>
                      </form>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>
    </div>
  );
}
