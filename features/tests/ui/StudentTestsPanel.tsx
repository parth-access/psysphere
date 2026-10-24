import Link from "next/link";
import { and, asc, eq, gt, inArray, isNotNull } from "drizzle-orm";
import { ArrowRight, Sparkles, Timer } from "lucide-react";
import { db } from "@/db";
import { tests, testAttempts } from "@/db/schema/academic/tests";
import { visibleBatchIds } from "@/server/authorization/access";
import { formatIST } from "@/lib/ids";

/** Student dashboard block: tests open now or coming up, and total XP. Renders nothing if there's nothing to show. */
export async function StudentTestsPanel({ student }: { student: { id: string; role: string } }) {
  const ids = await visibleBatchIds(student);
  if (ids !== "all" && ids.length === 0) return null;
  const now = new Date();

  const upcoming = await db
    .select()
    .from(tests)
    .where(and(ids === "all" ? undefined : inArray(tests.batchId, ids), isNotNull(tests.publishedAt), gt(tests.closesAt, now)))
    .orderBy(asc(tests.opensAt))
    .limit(10);
  const attempts = await db
    .select({ testId: testAttempts.testId, xp: testAttempts.xp, submittedAt: testAttempts.submittedAt })
    .from(testAttempts)
    .where(eq(testAttempts.studentProfileId, student.id));
  const done = new Set(attempts.filter((a) => a.submittedAt).map((a) => a.testId));
  const todo = upcoming.filter((t) => !done.has(t.id));
  const totalXp = attempts.reduce((s, a) => s + (a.xp ?? 0), 0);
  if (todo.length === 0 && attempts.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-500">Tests</h2>
        <Link href="/dashboard/tests" className="inline-flex items-center gap-1.5 rounded-full bg-butter px-3 py-1 text-xs font-bold text-gold-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {totalXp} XP
        </Link>
      </div>
      {todo.length === 0 ? (
        <p className="rounded-2xl border border-line bg-paper/50 p-5 text-center text-xs text-ink-500">No tests coming up. Past results are on the Tests page.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {todo.slice(0, 4).map((t) => {
            const open = t.opensAt <= now;
            return (
              <li key={t.id}>
                <Link href={`/dashboard/tests/${t.id}`} className={`group flex h-full flex-col gap-2 rounded-2xl border p-4 transition-colors ${open ? "border-forest-700 bg-forest-50" : "border-line bg-white hover:bg-paper"}`}>
                  <span className={`self-start rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${open ? "bg-forest-700 text-paper" : "bg-sky text-ink-900"}`}>
                    {open ? `Open · closes ${formatIST(t.closesAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}` : `Opens ${formatIST(t.opensAt, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}`}
                  </span>
                  <span className="text-sm font-bold text-ink-900">{t.title}</span>
                  <span className="mt-auto flex items-center justify-between text-xs text-ink-500">
                    <span className="inline-flex items-center gap-1"><Timer className="h-3.5 w-3.5" aria-hidden="true" />{t.durationMinutes} min</span>
                    {open && <span className="inline-flex items-center gap-1 font-bold text-forest-800">Take it <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
