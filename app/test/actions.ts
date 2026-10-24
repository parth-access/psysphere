"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { tests, testAttempts } from "@/db/schema/academic/tests";
import { requireRole } from "@/server/authorization/requireRole";
import { finalizeAttempt, getStudentTest, saveProgress, startAttempt, TestError } from "@/src/domains/tests/service";

const uuid = z.string().uuid();

export async function startTestAction(testId: string): Promise<{ ok: true } | { error: string }> {
  const me = await requireRole(["student"]);
  const row = await getStudentTest(uuid.parse(testId), me);
  if (!row) return { error: "Test not found." };
  try {
    await startAttempt(row.test, me.id);
    return { ok: true };
  } catch (err) {
    if (err instanceof TestError) return { error: err.message };
    throw err;
  }
}

const updateSchema = z.object({
  questionId: uuid,
  answer: z.string().max(4).nullable().optional(),
  marked: z.boolean().optional(),
});

export async function saveProgressAction(attemptId: string, update: z.infer<typeof updateSchema>) {
  const me = await requireRole(["student"]);
  try {
    return await saveProgress(uuid.parse(attemptId), me.id, updateSchema.parse(update));
  } catch (err) {
    if (err instanceof TestError) return { ok: false as const, reason: "invalid" as const };
    throw err;
  }
}

/** Used both for the Submit button and when the timer hits zero; the server's clock decides which it was. */
export async function submitTestAction(attemptId: string) {
  const me = await requireRole(["student"]);
  const [row] = await db
    .select({ attempt: testAttempts, test: tests })
    .from(testAttempts)
    .innerJoin(tests, eq(tests.id, testAttempts.testId))
    .where(eq(testAttempts.id, uuid.parse(attemptId)));
  if (!row || row.attempt.studentProfileId !== me.id) return { error: "Attempt not found." };
  const now = new Date();
  const why = now < row.attempt.endsAt ? "manual" : row.attempt.endsAt.getTime() >= row.test.closesAt.getTime() ? "closed" : "time_up";
  const done = await finalizeAttempt(row.attempt, row.test, why, now);
  // No revalidatePath: it would refresh /test/[id], which redirects once submitted and skips the done screen.
  // The dashboard pages are dynamic, so they show the new XP anyway.
  return { ok: true as const, xp: done.xp ?? 0 };
}
