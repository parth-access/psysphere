import Link from "next/link";
import { and, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { tests, testQuestions, testAttempts } from "@/db/schema/academic/tests";
import { batches } from "@/db/schema/core/batches";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { TestSettingsForm } from "@/features/tests/ui/TestForms";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { visibleBatchIds } from "@/server/authorization/access";
import { formatIST, istDateInput } from "@/lib/ids";
import { testPhase } from "@/src/domains/tests/logic";
import { finalizeExpiredFor } from "@/src/domains/tests/service";
import { createTestAction } from "./actions";

export const dynamic = "force-dynamic";

const pill = "rounded-full px-2.5 py-1 text-xs font-semibold";
const when = (d: Date) => formatIST(d, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default async function TestsPage() {
  const me = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);
  const ids = await visibleBatchIds(me);
  const isStudent = me.role === "student";
  const none = ids !== "all" && ids.length === 0;
  const now = new Date();

  const scope = ids === "all" ? undefined : inArray(tests.batchId, ids);
  const list = none
    ? []
    : await db
        .select({
          t: tests,
          batchName: batches.name,
          questions: sql<number>`(select count(*)::int from ${testQuestions} where ${testQuestions.testId} = ${tests.id})`,
          attempts: sql<number>`(select count(*)::int from ${testAttempts} where ${testAttempts.testId} = ${tests.id})`,
        })
        .from(tests)
        .innerJoin(batches, eq(batches.id, tests.batchId))
        .where(isStudent ? and(scope, isNotNull(tests.publishedAt)) : scope)
        .orderBy(desc(tests.opensAt))
        .limit(100);

  await finalizeExpiredFor(list.map((x) => x.t.id), now);
  const mine = isStudent && list.length
    ? new Map(
        (await db.select().from(testAttempts).where(and(eq(testAttempts.studentProfileId, me.id), inArray(testAttempts.testId, list.map((x) => x.t.id)))))
          .map((a) => [a.testId, a])
      )
    : new Map();
  const totalXp = [...mine.values()].reduce((s, a) => s + (a.xp ?? 0), 0);

  const myBatches = isStudent || none ? [] : await db
    .select({ id: batches.id, name: batches.name })
    .from(batches)
    .where(ids === "all" ? eq(batches.isActive, true) : and(eq(batches.isActive, true), inArray(batches.id, ids)));

  const tomorrow = new Date(now.getTime() + 86_400_000);
  const defaults = {
    title: "",
    instructions: "",
    opensDate: istDateInput(tomorrow),
    opensTime: "17:00",
    closesDate: istDateInput(tomorrow),
    closesTime: "21:00",
    durationMinutes: 30,
    marksPerCorrect: 1,
    penaltyPerWrong: 0,
    xpPerCorrect: 2,
    shuffle: true,
  };

  function badge(x: (typeof list)[number]): [string, string] {
    const phase = testPhase(x.t, now);
    if (!isStudent) {
      if (phase === "draft") return ["Draft", "bg-paper-deep text-ink-700"];
      if (phase === "scheduled") return ["Scheduled", "bg-sky text-ink-900"];
      if (phase === "open") return [`Open · ${x.attempts} started`, "bg-mint text-forest-800"];
      return [`Closed · ${x.attempts} took it`, "bg-ink-100 text-ink-700"];
    }
    const a = mine.get(x.t.id);
    if (a?.submittedAt) return phase === "closed" ? ["Results out", "bg-ink-100 text-ink-700"] : [`${a.xp} XP`, "bg-butter text-gold-700"];
    if (a) return ["In progress", "bg-mint text-forest-800"];
    if (phase === "scheduled") return ["Coming up", "bg-sky text-ink-900"];
    if (phase === "open") return ["Open now", "bg-mint text-forest-800"];
    return ["Missed", "bg-rose-100 text-rose-600"];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tests"
        description={isStudent ? "Timed MCQ tests. Your XP shows as soon as you submit; marks and answers once a test closes." : "Timed MCQ tests for your batches."}
        action={isStudent && mine.size > 0 ? (
          <div className="rounded-2xl bg-butter px-4 py-2 text-right">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Total XP</p>
            <p className="font-sans text-2xl font-semibold text-ink-900">{totalXp}</p>
          </div>
        ) : undefined}
      />
      <div className={`grid gap-8 ${isStudent ? "" : "xl:grid-cols-[minmax(0,1fr)_380px]"}`}>
        <div>
          <DashboardCard>
            {list.length === 0 ? (
              <p className="text-sm text-ink-500">{isStudent ? "No tests yet. They’ll show up here when your teacher sets one." : "No tests yet. Create one to start adding questions."}</p>
            ) : (
              <ul className="divide-y divide-line">
                {list.map((x) => {
                  const [text, cls] = badge(x);
                  return (
                    <li key={x.t.id}>
                      <Link href={`/dashboard/tests/${x.t.id}`} className="-mx-2 flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-4 hover:bg-paper">
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-900">{x.t.title}</p>
                          <p className="text-sm text-ink-500">
                            {x.batchName} · {x.questions} questions · {x.t.durationMinutes} min · {when(x.t.opensAt)} – {when(x.t.closesAt)}
                          </p>
                        </div>
                        <span className={`${pill} ${cls}`}>{text}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </DashboardCard>
        </div>

        {!isStudent && (
          <DashboardCard title="New test">
            {myBatches.length === 0 ? (
              <p className="text-sm text-ink-500">You need a batch first.</p>
            ) : (
              <TestSettingsForm action={createTestAction} defaults={defaults} batches={myBatches} submitLabel="Create and add questions" />
            )}
          </DashboardCard>
        )}
      </div>
    </div>
  );
}
