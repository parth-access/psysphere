import { ChevronDown, LogOut } from "lucide-react";
import type { testResults } from "@/src/domains/tests/service";
import type { TestOption } from "@/db/schema/academic/tests";
import { formatIST } from "@/lib/ids";

type Results = Awaited<ReturnType<typeof testResults>>;
type Exit = Results["attempts"][number]["exits"][number];

const LETTERS = "ABCDEF";
const EXIT_LABEL: Record<Exit["reason"], string> = {
  hidden: "Switched app or tab",
  blur: "Clicked outside the test",
  fullscreen: "Left full screen",
};

const clock = (d: Date) => formatIST(d, { hour: "numeric", minute: "2-digit", second: "2-digit" });
export function duration(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return m ? `${m}m ${String(s % 60).padStart(2, "0")}s` : `${s}s`;
}
const awayMs = (e: Exit, until: Date) => (e.returnedAt ?? until).getTime() - e.leftAt.getTime();

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-[20px] border border-line bg-surface p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">{label}</p>
      <p className="mt-1 font-sans text-3xl font-semibold text-ink-900">{value}</p>
      {note && <p className="text-sm text-ink-500">{note}</p>}
    </div>
  );
}

export function TestResultsView({
  results,
  notStarted,
  maxScore,
  maxXp,
  questionNumber,
  now,
}: {
  results: Results;
  notStarted: { id: string; name: string }[];
  maxScore: number;
  maxXp: number;
  /** Position of each question in the teacher's list, for "on Q5". */
  questionNumber: Record<string, number>;
  now: Date;
}) {
  const done = results.attempts.filter((a) => a.attempt.submittedAt);
  const scores = done.map((a) => Number(a.attempt.score));
  const avg = scores.length ? scores.reduce((s, n) => s + n, 0) / scores.length : 0;
  const leftCount = results.attempts.filter((a) => a.attempt.exitCount > 0).length;
  const round = (n: number) => Math.round(n * 10) / 10;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Submitted" value={`${done.length}`} note={`of ${results.attempts.length + notStarted.length} in the batch`} />
        <Tile label="Average" value={done.length ? `${round(avg)}` : "–"} note={`out of ${maxScore}`} />
        <Tile label="Highest" value={done.length ? `${Math.max(...scores)}` : "–"} note={`out of ${maxScore}`} />
        <Tile label="Left the screen" value={`${leftCount}`} note={leftCount === 1 ? "student at least once" : "students at least once"} />
      </div>

      <section aria-labelledby="students-title" className="overflow-hidden rounded-[24px] border border-line bg-surface">
        <h2 id="students-title" className="border-b border-line px-6 py-4 font-serif text-xl text-ink-900">Students</h2>
        {results.attempts.length === 0 && notStarted.length === 0 ? (
          <p className="p-6 text-sm text-ink-500">No students in this batch yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {results.attempts.map(({ attempt: a, name, exits }) => {
              const finished = a.submittedAt;
              const taken = (finished ?? now).getTime() - a.startedAt.getTime();
              const away = exits.reduce((s, e) => s + awayMs(e, finished ?? now), 0);
              const skipped = a.questionOrder.length - (a.correctCount ?? 0) - (a.wrongCount ?? 0);
              return (
                <li key={a.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 hover:bg-paper [&::-webkit-details-marker]:hidden">
                      <span className="min-w-40 flex-1 font-semibold text-ink-900">{name}</span>
                      {finished ? (
                        <>
                          <span className="w-28 text-sm"><strong className="font-sans text-lg font-semibold text-ink-900">{Number(a.score)}</strong><span className="text-ink-500"> / {maxScore}</span></span>
                          <span className="w-20 text-sm text-ink-700">{a.xp}/{maxXp} XP</span>
                          <span className="w-36 text-sm text-ink-500">{a.correctCount} right · {a.wrongCount} wrong · {skipped} skipped</span>
                        </>
                      ) : (
                        <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-forest-800">Taking it now · ends {formatIST(a.endsAt, { hour: "numeric", minute: "2-digit" })}</span>
                      )}
                      <span className="w-24 text-sm text-ink-500">{duration(taken)}</span>
                      <span className={`inline-flex w-28 items-center gap-1.5 text-sm ${a.exitCount ? "font-semibold text-rose-600" : "text-ink-500"}`}>
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        {a.exitCount ? `Left ${a.exitCount}×` : "Stayed"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-ink-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="space-y-3 bg-paper px-6 py-4 text-sm">
                      <p className="text-ink-700">
                        Started {formatIST(a.startedAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                        {finished && <> · {a.submitReason === "manual" ? "submitted" : a.submitReason === "time_up" ? "time ran out" : "test closed"} {clock(finished)}</>}
                      </p>
                      {exits.length === 0 ? (
                        <p className="text-ink-500">Stayed on the test screen the whole time.</p>
                      ) : (
                        <>
                          <p className="font-semibold text-ink-900">Left the test {exits.length} time{exits.length === 1 ? "" : "s"}, away {duration(away)} in total</p>
                          <ol className="space-y-1.5">
                            {exits.map((e) => (
                              <li key={e.id} className="flex flex-wrap gap-x-3 text-ink-700">
                                <span className="w-24 font-mono text-xs leading-5 text-ink-500">{clock(e.leftAt)}</span>
                                <span className="font-medium">{EXIT_LABEL[e.reason]}</span>
                                <span>· away {duration(awayMs(e, finished ?? now))}{!e.returnedAt && " (didn’t come back)"}</span>
                                {e.questionId && questionNumber[e.questionId] && <span className="text-ink-500">· on Q{questionNumber[e.questionId]}</span>}
                              </li>
                            ))}
                          </ol>
                        </>
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
            {notStarted.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-6 px-6 py-4">
                <span className="min-w-40 flex-1 font-semibold text-ink-500">{s.name}</span>
                <span className="text-sm text-ink-500">Not started</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        <section aria-labelledby="questions-title" className="overflow-hidden rounded-[24px] border border-line bg-surface">
          <div className="border-b border-line px-6 py-4">
            <h2 id="questions-title" className="font-serif text-xl text-ink-900">Question by question</h2>
            <p className="text-sm text-ink-500">Share of submitted students who got each one right. Low ones are worth going over in class.</p>
          </div>
          <ol className="divide-y divide-line">
            {results.questions.map((q, i) => {
              const s = results.questionStats.find((x) => x.questionId === q.id)!;
              const pct = Math.round((s.correct / done.length) * 100);
              const commonWrong = Object.entries(s.picks)
                .filter(([id]) => id !== q.correctOptionId)
                .sort((a, b) => b[1] - a[1])[0];
              const optIndex = (id: string) => (q.options as TestOption[]).findIndex((o) => o.id === id);
              return (
                <li key={q.id} className="grid gap-2 px-6 py-4 sm:grid-cols-[1fr_220px] sm:items-center sm:gap-6">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink-900"><span className="font-bold">Q{i + 1}.</span> {q.prompt}</p>
                    <p className="text-xs text-ink-500">
                      {s.answered < done.length && `${done.length - s.answered} skipped`}
                      {commonWrong && `${s.answered < done.length ? " · " : ""}most common wrong pick: ${LETTERS[optIndex(commonWrong[0])]} (${commonWrong[1]})`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-forest-100" aria-hidden="true">
                      <div className={`h-full rounded-full ${pct < 40 ? "bg-gold-600" : "bg-forest-700"}`} style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                    <span className="w-24 text-right text-sm"><strong className="font-semibold text-ink-900">{pct}%</strong> <span className="text-ink-500">right</span></span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
