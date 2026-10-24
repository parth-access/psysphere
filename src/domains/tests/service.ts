import { and, asc, eq, inArray, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { tests, testQuestions, testAttempts, testAttemptExits } from "@/db/schema/academic/tests";
import { batches } from "@/db/schema/core/batches";
import { profiles } from "@/db/schema/core/profiles";
import { canAccessBatch, canManageBatch } from "@/server/authorization/access";
import { buildOrder, scoreAnswers, testPhase } from "./logic";

type Viewer = { id: string; role: string };
export type Test = typeof tests.$inferSelect;
export type TestQuestion = typeof testQuestions.$inferSelect;
export type TestAttempt = typeof testAttempts.$inferSelect;

export class TestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TestError";
  }
}

/** Answers saved this long after the time limit still count, to cover a slow network on the last click. */
const GRACE_MS = 15_000;

export const marking = (t: Test) => ({
  marksPerCorrect: Number(t.marksPerCorrect),
  penaltyPerWrong: Number(t.penaltyPerWrong),
  xpPerCorrect: t.xpPerCorrect,
});

export async function listQuestions(testId: string) {
  return db.select().from(testQuestions).where(eq(testQuestions.testId, testId)).orderBy(asc(testQuestions.position), asc(testQuestions.createdAt));
}

/** A test the viewer may edit (teacher of the batch, or admin), with its batch name. */
export async function getManagedTest(id: string, viewer: Viewer) {
  const [row] = await db
    .select({ test: tests, batchName: batches.name })
    .from(tests)
    .innerJoin(batches, eq(batches.id, tests.batchId))
    .where(eq(tests.id, id));
  if (!row || !(await canManageBatch(viewer, row.test.batchId))) return null;
  return row;
}

/** A published test in one of the student's batches. */
export async function getStudentTest(id: string, viewer: Viewer) {
  const [row] = await db
    .select({ test: tests, batchName: batches.name })
    .from(tests)
    .innerJoin(batches, eq(batches.id, tests.batchId))
    .where(eq(tests.id, id));
  if (!row || !row.test.publishedAt || !(await canAccessBatch(viewer, row.test.batchId))) return null;
  return row;
}

export async function attemptCount(testId: string) {
  const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(testAttempts).where(eq(testAttempts.testId, testId));
  return r?.n ?? 0;
}

/** Questions and settings can't change once a student has started, or scores would shift. */
export async function assertEditable(testId: string) {
  if ((await attemptCount(testId)) > 0) throw new TestError("Students have started this test, so it can't be changed now.");
}

/* ------------------------------------------------------------------ */
/* Taking a test                                                       */
/* ------------------------------------------------------------------ */

export async function getAttempt(testId: string, studentId: string) {
  const [a] = await db
    .select()
    .from(testAttempts)
    .where(and(eq(testAttempts.testId, testId), eq(testAttempts.studentProfileId, studentId)));
  return a ?? null;
}

/** Starts the student's one attempt, or returns it if it already exists. */
export async function startAttempt(test: Test, studentId: string, now = new Date()) {
  const existing = await getAttempt(test.id, studentId);
  if (existing) return existing;
  const phase = testPhase(test, now);
  if (phase === "scheduled") throw new TestError("This test hasn't opened yet.");
  if (phase !== "open") throw new TestError("This test has closed.");

  const questions = await listQuestions(test.id);
  if (questions.length === 0) throw new TestError("This test has no questions yet.");

  const order = buildOrder(questions, test.shuffle);
  const endsAt = new Date(Math.min(now.getTime() + test.durationMinutes * 60_000, test.closesAt.getTime()));
  await db
    .insert(testAttempts)
    .values({ testId: test.id, studentProfileId: studentId, startedAt: now, endsAt, ...order })
    .onConflictDoNothing({ target: [testAttempts.testId, testAttempts.studentProfileId] });
  return (await getAttempt(test.id, studentId))!;
}

export type ProgressUpdate = { questionId: string; answer?: string | null; marked?: boolean };

/** Saves one change. Every change also marks the question as visited. */
export async function saveProgress(attemptId: string, studentId: string, u: ProgressUpdate, now = new Date()) {
  const [a] = await db
    .select()
    .from(testAttempts)
    .where(and(eq(testAttempts.id, attemptId), eq(testAttempts.studentProfileId, studentId)));
  if (!a) throw new TestError("Attempt not found.");
  if (a.submittedAt) return { ok: false as const, reason: "submitted" as const };
  if (now.getTime() > a.endsAt.getTime() + GRACE_MS) return { ok: false as const, reason: "time_up" as const };
  if (!a.questionOrder.includes(u.questionId)) throw new TestError("Unknown question.");
  if (u.answer && !a.optionOrder[u.questionId]?.includes(u.answer)) throw new TestError("Unknown option.");

  const q = u.questionId;
  const answers =
    u.answer === undefined ? sql`${testAttempts.answers}`
    : u.answer === null ? sql`${testAttempts.answers} - ${q}::text`
    : sql`${testAttempts.answers} || jsonb_build_object(${q}::text, ${u.answer}::text)`;
  const marked =
    u.marked === undefined ? sql`${testAttempts.markedForReview}`
    : u.marked ? sql`case when ${testAttempts.markedForReview} ? ${q}::text then ${testAttempts.markedForReview} else ${testAttempts.markedForReview} || to_jsonb(${q}::text) end`
    : sql`${testAttempts.markedForReview} - ${q}::text`;

  const [saved] = await db
    .update(testAttempts)
    .set({
      answers,
      markedForReview: marked,
      visited: sql`case when ${testAttempts.visited} ? ${q}::text then ${testAttempts.visited} else ${testAttempts.visited} || to_jsonb(${q}::text) end`,
      updatedAt: now,
    })
    .where(and(eq(testAttempts.id, a.id), isNull(testAttempts.submittedAt)))
    .returning({ id: testAttempts.id });
  return saved ? { ok: true as const } : { ok: false as const, reason: "submitted" as const };
}

/** Scores and closes an attempt. Safe to call twice: only the first call writes. */
export async function finalizeAttempt(a: TestAttempt, test: Test, reason: "manual" | "time_up" | "closed", now = new Date()) {
  if (a.submittedAt) return a;
  const questions = await listQuestions(test.id);
  const keyed = questions.filter((q) => a.questionOrder.includes(q.id));
  const r = scoreAnswers(keyed, a.answers, marking(test));
  const [row] = await db
    .update(testAttempts)
    .set({
      submittedAt: reason === "manual" ? now : new Date(Math.min(now.getTime(), a.endsAt.getTime())),
      submitReason: reason,
      correctCount: r.correct,
      wrongCount: r.wrong,
      score: String(r.score),
      xp: r.xp,
      updatedAt: now,
    })
    .where(and(eq(testAttempts.id, a.id), isNull(testAttempts.submittedAt)))
    .returning();
  return row ?? (await db.select().from(testAttempts).where(eq(testAttempts.id, a.id)))[0];
}

/** Closes attempts whose time ran out while the student was away (closed the tab, lost signal). */
export async function finalizeExpired(test: Test, now = new Date()) {
  const open = await db
    .select()
    .from(testAttempts)
    .where(and(eq(testAttempts.testId, test.id), isNull(testAttempts.submittedAt), lte(testAttempts.endsAt, new Date(now.getTime() - GRACE_MS))));
  for (const a of open) {
    await finalizeAttempt(a, test, a.endsAt.getTime() >= test.closesAt.getTime() ? "closed" : "time_up", now);
  }
}

/** Finishes expired attempts across many tests at once, for list pages and reports. */
export async function finalizeExpiredFor(testIds: string[], now = new Date()) {
  if (testIds.length === 0) return;
  const stale = await db
    .selectDistinct({ testId: testAttempts.testId })
    .from(testAttempts)
    .where(and(inArray(testAttempts.testId, testIds), isNull(testAttempts.submittedAt), lte(testAttempts.endsAt, new Date(now.getTime() - GRACE_MS))));
  if (stale.length === 0) return;
  const rows = await db.select().from(tests).where(inArray(tests.id, stale.map((s) => s.testId)));
  for (const t of rows) await finalizeExpired(t, now);
}

/* ------------------------------------------------------------------ */
/* Leaving the test screen                                             */
/* ------------------------------------------------------------------ */

async function ownAttempt(attemptId: string, studentId: string) {
  const [a] = await db
    .select({ id: testAttempts.id, submittedAt: testAttempts.submittedAt, questionOrder: testAttempts.questionOrder })
    .from(testAttempts)
    .where(and(eq(testAttempts.id, attemptId), eq(testAttempts.studentProfileId, studentId)));
  return a ?? null;
}

export async function recordExit(
  attemptId: string,
  studentId: string,
  e: { id: string; reason: "hidden" | "blur" | "fullscreen"; questionId?: string | null }
) {
  const a = await ownAttempt(attemptId, studentId);
  if (!a || a.submittedAt) return;
  const questionId = e.questionId && a.questionOrder.includes(e.questionId) ? e.questionId : null;
  const [inserted] = await db
    .insert(testAttemptExits)
    .values({ id: e.id, attemptId, reason: e.reason, questionId })
    .onConflictDoNothing()
    .returning({ id: testAttemptExits.id });
  if (inserted) {
    await db.update(testAttempts).set({ exitCount: sql`${testAttempts.exitCount} + 1` }).where(eq(testAttempts.id, attemptId));
  }
}

export async function recordReturn(attemptId: string, studentId: string, exitId: string) {
  const a = await ownAttempt(attemptId, studentId);
  if (!a) return;
  await db
    .update(testAttemptExits)
    .set({ returnedAt: new Date() })
    .where(and(eq(testAttemptExits.id, exitId), eq(testAttemptExits.attemptId, attemptId), isNull(testAttemptExits.returnedAt)));
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

/** Everything the teacher's results view needs. */
export async function testResults(test: Test, now = new Date()) {
  await finalizeExpired(test, now);
  const questions = await listQuestions(test.id);
  const attempts = await db
    .select({ attempt: testAttempts, name: profiles.fullName, email: profiles.email })
    .from(testAttempts)
    .innerJoin(profiles, eq(profiles.id, testAttempts.studentProfileId))
    .where(eq(testAttempts.testId, test.id))
    .orderBy(asc(profiles.fullName));
  const exits = attempts.length
    ? await db
        .select()
        .from(testAttemptExits)
        .where(inArray(testAttemptExits.attemptId, attempts.map((a) => a.attempt.id)))
        .orderBy(asc(testAttemptExits.leftAt))
    : [];

  const submitted = attempts.filter((a) => a.attempt.submittedAt);
  const questionStats = questions.map((q) => {
    const picks: Record<string, number> = {};
    let answered = 0;
    for (const { attempt } of submitted) {
      const a = attempt.answers[q.id];
      if (!a) continue;
      answered++;
      picks[a] = (picks[a] ?? 0) + 1;
    }
    return { questionId: q.id, answered, correct: picks[q.correctOptionId] ?? 0, picks };
  });

  return {
    questions,
    attempts: attempts.map((a) => ({ ...a, exits: exits.filter((e) => e.attemptId === a.attempt.id) })),
    questionStats,
    submittedCount: submitted.length,
  };
}
