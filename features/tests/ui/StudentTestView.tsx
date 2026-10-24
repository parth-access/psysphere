import Link from "next/link";
import { CalendarClock, Check, Clock, ListChecks, Sparkles, X } from "lucide-react";
import type { Test, TestAttempt, TestQuestion } from "@/src/domains/tests/service";
import type { TestPhase } from "@/src/domains/tests/logic";
import { formatIST } from "@/lib/ids";

const LETTERS = "ABCDEF";
const when = (d: Date) => formatIST(d, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const startBtn = "inline-flex min-h-12 items-center justify-center rounded-full bg-forest-800 px-6 font-bold text-paper hover:bg-forest-900";

function Facts({ test, count }: { test: Test; count: number }) {
  const penalty = Number(test.penaltyPerWrong);
  return (
    <ul className="grid gap-3 text-[15px] text-ink-700 sm:grid-cols-3">
      <li className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-forest-800" aria-hidden="true" />{count} questions</li>
      <li className="flex items-center gap-2"><Clock className="h-5 w-5 text-forest-800" aria-hidden="true" />{test.durationMinutes} minutes</li>
      <li className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-forest-800" aria-hidden="true" />
        +{Number(test.marksPerCorrect)}{penalty ? ` / −${penalty}` : ""} per question
      </li>
    </ul>
  );
}

export function StudentTestView({
  test,
  phase,
  attempt,
  questions,
  imageUrls,
}: {
  test: Test;
  phase: TestPhase;
  attempt: TestAttempt | null;
  /** In the order this student saw them. */
  questions: TestQuestion[];
  imageUrls: Record<string, string>;
}) {
  const maxXp = questions.length * test.xpPerCorrect;
  const maxScore = questions.length * Number(test.marksPerCorrect);

  if (phase !== "closed") {
    return (
      <div className="space-y-6">
        <section className="space-y-5 rounded-[28px] border border-line bg-surface p-6 sm:p-8">
          <Facts test={test} count={questions.length} />
          {test.instructions && <p className="whitespace-pre-line text-ink-700">{test.instructions}</p>}
          <p className="flex items-center gap-2 text-sm text-ink-500">
            <CalendarClock className="h-4 w-4" aria-hidden="true" /> Open {when(test.opensAt)} to {when(test.closesAt)}
          </p>

          {attempt?.submittedAt ? (
            <div className="rounded-[20px] bg-butter p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Submitted</p>
              <p className="mt-1 font-sans text-5xl font-semibold text-ink-900">{attempt.xp}<span className="text-2xl text-ink-500">/{maxXp} XP</span></p>
              <p className="mt-2 text-ink-700">Your marks and the right answers unlock when the test closes, {when(test.closesAt)}.</p>
            </div>
          ) : attempt ? (
            <div className="flex flex-wrap items-center gap-4">
              <Link href={`/test/${test.id}`} className={startBtn}>Resume test</Link>
              <p className="text-sm text-ink-500">Your timer is still running. It ends {formatIST(attempt.endsAt, { hour: "numeric", minute: "2-digit" })}.</p>
            </div>
          ) : phase === "open" ? (
            <div className="flex flex-wrap items-center gap-4">
              <Link href={`/test/${test.id}`} className={startBtn}>Go to test</Link>
              <p className="text-sm text-ink-500">You’ll see the rules first. The timer starts when you press Start.</p>
            </div>
          ) : (
            <p className="rounded-[20px] bg-sky p-5 text-ink-900">This test opens {when(test.opensAt)}.</p>
          )}
        </section>
      </div>
    );
  }

  // Closed: show marks and every question with the right answer.
  const answers = attempt?.answers ?? {};
  return (
    <div className="space-y-6">
      {attempt?.submittedAt ? (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] bg-forest-900 p-6 text-paper">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-400">Marks</p>
            <p className="mt-1 font-sans text-5xl font-semibold">{Number(attempt.score)}<span className="text-2xl text-paper/60">/{maxScore}</span></p>
          </div>
          <div className="rounded-[24px] bg-butter p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">XP earned</p>
            <p className="mt-1 font-sans text-5xl font-semibold text-ink-900">{attempt.xp}<span className="text-2xl text-ink-500">/{maxXp}</span></p>
          </div>
          <div className="rounded-[24px] border border-line bg-surface p-6 text-ink-700">
            <p><strong className="font-sans text-2xl font-semibold text-forest-800">{attempt.correctCount}</strong> right</p>
            <p><strong className="font-sans text-2xl font-semibold text-rose-600">{attempt.wrongCount}</strong> wrong</p>
            <p><strong className="font-sans text-2xl font-semibold text-ink-900">{questions.length - (attempt.correctCount ?? 0) - (attempt.wrongCount ?? 0)}</strong> skipped</p>
          </div>
        </section>
      ) : (
        <p className="rounded-[20px] bg-rose-100 p-5 text-rose-600">You didn’t take this test. Here are the questions and answers so you can still learn from it.</p>
      )}

      <section aria-labelledby="review-title" className="space-y-4">
        <h2 id="review-title" className="font-serif text-2xl text-ink-900">Answers</h2>
        <ol className="space-y-4">
          {questions.map((q, i) => {
            const picked = answers[q.id];
            const order = attempt?.optionOrder[q.id] ?? q.options.map((o) => o.id);
            const options = order.map((id) => q.options.find((o) => o.id === id)!).filter(Boolean);
            const verdict = !attempt ? null : !picked ? "skipped" : picked === q.correctOptionId ? "right" : "wrong";
            return (
              <li key={q.id} className="rounded-[20px] border border-line bg-surface p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="whitespace-pre-line font-medium text-ink-900"><span className="font-bold">{i + 1}.</span> {q.prompt}</p>
                  {verdict && (
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${verdict === "right" ? "bg-forest-50 text-forest-800" : verdict === "wrong" ? "bg-rose-100 text-rose-600" : "bg-paper-deep text-ink-700"}`}>
                      {verdict === "right" ? `+${Number(test.marksPerCorrect)}` : verdict === "wrong" ? (Number(test.penaltyPerWrong) ? `−${Number(test.penaltyPerWrong)}` : "Wrong") : "Skipped"}
                    </span>
                  )}
                </div>
                {q.imagePath && imageUrls[q.imagePath] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrls[q.imagePath]} alt="" className="mb-3 max-h-64 w-auto rounded-xl border border-line" />
                )}
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {options.map((o, n) => {
                    const right = o.id === q.correctOptionId;
                    const mine = o.id === picked;
                    return (
                      <li
                        key={o.id}
                        className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${right ? "bg-forest-50 font-semibold text-forest-800" : mine ? "bg-rose-100 text-rose-600" : "bg-paper text-ink-700"}`}
                      >
                        <span className="font-bold">{LETTERS[n]}</span>
                        <span className="flex-1">{o.text}</span>
                        {right && <Check className="h-4 w-4 shrink-0" aria-label="Right answer" />}
                        {mine && !right && <X className="h-4 w-4 shrink-0" aria-label="Your answer" />}
                        {mine && right && <span className="sr-only">(your answer)</span>}
                      </li>
                    );
                  })}
                </ul>
                {q.explanation && <p className="mt-3 rounded-xl bg-paper-deep p-3 text-sm text-ink-700"><span className="font-semibold">Why:</span> {q.explanation}</p>}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
