import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { enrollments } from "@/db/schema/core/enrollments";
import { profiles } from "@/db/schema/core/profiles";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { BulkPasteForm, QuestionForm, TestSettingsForm } from "@/features/tests/ui/TestForms";
import { QuestionCard } from "@/features/tests/ui/QuestionCard";
import { TestResultsView } from "@/features/tests/ui/TestResults";
import { StudentTestView } from "@/features/tests/ui/StudentTestView";
import { ConfirmForm } from "@/features/tests/ui/ConfirmForm";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { formatIST, isUuid, istDateInput, istTimeInput } from "@/lib/ids";
import { testPhase, type TestPhase } from "@/src/domains/tests/logic";
import { finalizeExpired, getAttempt, getManagedTest, getStudentTest, listQuestions, marking, testResults } from "@/src/domains/tests/service";
import { signedTestImageUrls } from "@/src/domains/tests/storage";
import { bulkAddQuestionsAction, deleteTestAction, publishTestAction, saveQuestionAction, updateTestAction } from "../actions";
import { PendingButton } from "@/features/shared/ui/PendingButton";

export const dynamic = "force-dynamic";

const btn = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold";
const PHASE: Record<TestPhase, [string, string]> = {
  draft: ["Draft · students can’t see it", "bg-paper-deep text-ink-700"],
  scheduled: ["Scheduled", "bg-sky text-ink-900"],
  open: ["Open now", "bg-mint text-forest-800"],
  closed: ["Closed", "bg-ink-100 text-ink-700"],
};
const when = (d: Date) => formatIST(d, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default async function TestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const me = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);
  const { id } = await params;
  const { notice } = await searchParams;
  if (!isUuid(id)) notFound();
  const now = new Date();

  const back = (
    <Link href="/dashboard/tests" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All tests
    </Link>
  );

  /* ---------------- Student ---------------- */
  if (me.role === "student") {
    const row = await getStudentTest(id, me);
    if (!row) notFound();
    const { test } = row;
    await finalizeExpired(test, now);
    const phase = testPhase(test, now);
    const attempt = await getAttempt(test.id, me.id);
    const all = await listQuestions(test.id);
    const ordered = attempt ? attempt.questionOrder.map((qid) => all.find((q) => q.id === qid)!).filter(Boolean) : all;
    // Images are only needed once answers are shown; the test screen signs its own.
    const imageUrls = phase === "closed" ? await signedTestImageUrls(ordered.map((q) => q.imagePath ?? "")) : {};
    return (
      <div className="space-y-6">
        {back}
        <div>
          <h1 className="font-serif text-[36px] leading-[1.05] text-ink-900">{test.title}</h1>
          <p className="text-sm text-ink-500">{row.batchName}</p>
        </div>
        <StudentTestView test={test} phase={phase} attempt={attempt} questions={ordered} imageUrls={imageUrls} />
      </div>
    );
  }

  /* ---------------- Teacher / admin ---------------- */
  const row = await getManagedTest(id, me);
  if (!row) notFound();
  const { test } = row;
  const phase = testPhase(test, now);
  const results = await testResults(test, now);
  const { questions } = results;
  const started = results.attempts.length > 0;
  const imageUrls = await signedTestImageUrls(questions.map((q) => q.imagePath ?? ""));
  const m = marking(test);

  const enrolled = await db
    .select({ id: profiles.id, name: profiles.fullName })
    .from(enrollments)
    .innerJoin(profiles, eq(profiles.id, enrollments.studentProfileId))
    .where(and(eq(enrollments.batchId, test.batchId), eq(enrollments.status, "active")))
    .orderBy(asc(profiles.fullName));
  const startedIds = new Set(results.attempts.map((a) => a.attempt.studentProfileId));
  const notStarted = enrolled.filter((s) => !startedIds.has(s.id));

  const [phaseText, phaseCls] = PHASE[phase];
  const settings = {
    title: test.title,
    instructions: test.instructions ?? "",
    opensDate: istDateInput(test.opensAt),
    opensTime: istTimeInput(test.opensAt),
    closesDate: istDateInput(test.closesAt),
    closesTime: istTimeInput(test.closesAt),
    durationMinutes: test.durationMinutes,
    marksPerCorrect: m.marksPerCorrect,
    penaltyPerWrong: m.penaltyPerWrong,
    xpPerCorrect: m.xpPerCorrect,
    shuffle: test.shuffle,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        {back}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-[36px] leading-[1.05] text-ink-900">{test.title}</h1>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${phaseCls}`}>{phaseText}</span>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              {row.batchName} · {questions.length} questions · {test.durationMinutes} min · {when(test.opensAt)} – {when(test.closesAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!started && (
              <form action={publishTestAction}>
                <input type="hidden" name="testId" value={test.id} />
                <PendingButton className={`${btn} ${test.publishedAt ? "border border-line bg-white text-ink-900 hover:bg-paper" : "bg-forest-800 text-paper hover:bg-forest-900"}`}>
                  {test.publishedAt ? "Hide (back to draft)" : "Publish to students"}
                </PendingButton>
              </form>
            )}
            {!started && (
              <ConfirmForm action={deleteTestAction} message={`Delete “${test.title}” and all its questions? This can’t be undone.`}>
                <input type="hidden" name="testId" value={test.id} />
                <PendingButton className={`${btn} text-rose-600 hover:bg-rose-100`}>Delete test</PendingButton>
              </ConfirmForm>
            )}
          </div>
        </div>
        {notice && <p role="status" className="rounded-xl bg-forest-50 p-3 text-sm font-medium text-forest-800">{notice}</p>}
        {started && (
          <p className="rounded-xl bg-paper-deep p-3 text-sm text-ink-700">
            Students have started, so questions and settings are locked. That keeps everyone’s marks comparable.
          </p>
        )}
      </div>

      {(started || phase === "open" || phase === "closed") && (
        <TestResultsView
          results={results}
          notStarted={notStarted}
          maxScore={questions.length * m.marksPerCorrect}
          maxXp={questions.length * m.xpPerCorrect}
          questionNumber={Object.fromEntries(questions.map((q, i) => [q.id, i + 1]))}
          now={now}
        />
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl text-ink-900">Questions</h2>
            <p className="text-sm text-ink-500">
              {questions.length} · out of {questions.length * m.marksPerCorrect} marks · {questions.length * m.xpPerCorrect} XP
            </p>
          </div>
          {questions.length === 0 ? (
            <p className="rounded-[20px] border border-dashed border-line p-6 text-sm text-ink-500">No questions yet. Add one, or paste many at once.</p>
          ) : (
            <ol className="space-y-3">
              {questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  testId={test.id}
                  number={i + 1}
                  total={questions.length}
                  q={q}
                  imageUrl={q.imagePath ? imageUrls[q.imagePath] : null}
                  locked={started}
                />
              ))}
            </ol>
          )}
        </div>

        <div className="space-y-6">
          {!started && (
            <>
              <DashboardCard title="Add a question">
                <QuestionForm action={saveQuestionAction} testId={test.id} />
              </DashboardCard>
              <DashboardCard title="Paste many">
                <BulkPasteForm action={bulkAddQuestionsAction} testId={test.id} />
              </DashboardCard>
            </>
          )}
          <DashboardCard title="Settings">
            <TestSettingsForm action={updateTestAction} defaults={settings} testId={test.id} locked={started} submitLabel="Save settings" />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
