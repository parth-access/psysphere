import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { isUuid } from "@/lib/ids";
import { testPhase } from "@/src/domains/tests/logic";
import { finalizeExpired, getAttempt, getStudentTest, listQuestions, marking } from "@/src/domains/tests/service";
import { signedTestImageUrls } from "@/src/domains/tests/storage";
import { TestApp, type RunnerQuestion } from "@/features/tests/ui/TestApp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Test | Saarthi Classes", robots: { index: false } };

/** The full-screen test. Students only; everyone else uses the dashboard page. */
export default async function TakeTestPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await enforcePageRole([ROLES.STUDENT]);
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const row = await getStudentTest(id, me);
  if (!row) notFound();
  const { test } = row;

  const now = new Date();
  await finalizeExpired(test, now);
  const attempt = await getAttempt(test.id, me.id);
  // Finished, or never started and no longer open: the dashboard page shows XP or results.
  if (attempt?.submittedAt || (!attempt && testPhase(test, now) !== "open")) redirect(`/dashboard/tests/${test.id}`);

  const all = await listQuestions(test.id);
  const m = marking(test);
  const info = {
    testId: test.id,
    title: test.title,
    batchName: row.batchName,
    instructions: test.instructions,
    durationMinutes: test.durationMinutes,
    questionCount: all.length,
    ...m,
    closesAt: test.closesAt.toISOString(),
  };

  let questions: RunnerQuestion[] = [];
  if (attempt) {
    const byId = new Map(all.map((q) => [q.id, q]));
    const images = await signedTestImageUrls(all.map((q) => q.imagePath ?? ""));
    // Only what the student needs: their order, no correct answers, no explanations.
    questions = attempt.questionOrder.flatMap((qid) => {
      const q = byId.get(qid);
      if (!q) return [];
      const options = (attempt.optionOrder[qid] ?? q.options.map((o) => o.id))
        .map((oid) => q.options.find((o) => o.id === oid))
        .filter((o): o is NonNullable<typeof o> => !!o);
      return [{ id: q.id, prompt: q.prompt, imageUrl: q.imagePath ? images[q.imagePath] ?? null : null, options }];
    });
  }

  return (
    <TestApp
      info={info}
      serverNow={now.toISOString()}
      questions={questions}
      attempt={
        attempt && {
          id: attempt.id,
          endsAt: attempt.endsAt.toISOString(),
          answers: attempt.answers,
          marked: attempt.markedForReview,
          visited: attempt.visited,
          exitCount: attempt.exitCount,
        }
      }
    />
  );
}
