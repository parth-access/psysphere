"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { tests, testQuestions } from "@/db/schema/academic/tests";
import { requireRole } from "@/server/authorization/requireRole";
import { canManageBatch } from "@/server/authorization/access";
import { optionId, parseBulkQuestions } from "@/src/domains/tests/logic";
import { assertEditable, attemptCount, getManagedTest, listQuestions, TestError } from "@/src/domains/tests/service";
import { MAX_TEST_IMAGE_BYTES, TEST_IMAGE_TYPES, deleteTestImages, uploadTestImage } from "@/src/domains/tests/storage";

export type FormState = { error?: string; errors?: string[]; ok?: string } | null;

const ist = (date: string, time: string) => new Date(`${date}T${time}:00+05:30`);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");
const time = z.string().regex(/^\d{2}:\d{2}$/, "Pick a time");

const settingsSchema = z
  .object({
    title: z.string().trim().min(3, "Give the test a title").max(150),
    instructions: z.string().trim().max(5000).optional().transform((v) => v || null),
    opensDate: date,
    opensTime: time,
    closesDate: date,
    closesTime: time,
    durationMinutes: z.coerce.number().int().min(1, "Time limit must be at least 1 minute").max(600),
    marksPerCorrect: z.coerce.number().min(0.25).max(100),
    penaltyPerWrong: z.coerce.number().min(0).max(100),
    xpPerCorrect: z.coerce.number().int().min(1).max(100),
    shuffle: z.literal("on").optional().transform((v) => v === "on"),
  })
  .transform((v) => ({ ...v, opensAt: ist(v.opensDate, v.opensTime), closesAt: ist(v.closesDate, v.closesTime) }))
  .refine((v) => v.closesAt > v.opensAt, { message: "The test must close after it opens", path: ["closesDate"] });

const firstIssue = (e: z.ZodError) => e.issues[0]?.message ?? "Check the form";

function settingsValues(v: z.infer<typeof settingsSchema>) {
  return {
    title: v.title,
    instructions: v.instructions,
    opensAt: v.opensAt,
    closesAt: v.closesAt,
    durationMinutes: v.durationMinutes,
    marksPerCorrect: String(v.marksPerCorrect),
    penaltyPerWrong: String(v.penaltyPerWrong),
    xpPerCorrect: v.xpPerCorrect,
    shuffle: v.shuffle,
  };
}

async function managed(testId: string) {
  const me = await requireRole(["admin", "teacher"]);
  const row = await getManagedTest(z.string().uuid().parse(testId), me);
  if (!row) throw new TestError("Test not found.");
  return { me, test: row.test };
}

const refresh = (testId: string) => {
  revalidatePath(`/dashboard/tests/${testId}`);
  revalidatePath("/dashboard/tests");
};

export async function createTestAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireRole(["admin", "teacher"]);
  const batchId = z.string().uuid().safeParse(formData.get("batchId"));
  if (!batchId.success) return { error: "Choose a batch" };
  if (!(await canManageBatch(me, batchId.data))) return { error: "You can only set tests for your own batches." };
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const [row] = await db
    .insert(tests)
    .values({ ...settingsValues(parsed.data), batchId: batchId.data, createdBy: me.id, updatedBy: me.id })
    .returning({ id: tests.id });
  revalidatePath("/dashboard/tests");
  redirect(`/dashboard/tests/${row.id}`);
}

export async function updateTestAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { me, test } = await managed(String(formData.get("testId")));
    await assertEditable(test.id);
    const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    await db.update(tests).set({ ...settingsValues(parsed.data), updatedBy: me.id, updatedAt: new Date() }).where(eq(tests.id, test.id));
    refresh(test.id);
    return { ok: "Saved" };
  } catch (err) {
    if (err instanceof TestError) return { error: err.message };
    throw err;
  }
}

async function nextPosition(testId: string) {
  const [r] = await db.select({ p: max(testQuestions.position) }).from(testQuestions).where(eq(testQuestions.testId, testId));
  return (r?.p ?? -1) + 1;
}

async function saveImage(testId: string, file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!TEST_IMAGE_TYPES.includes(file.type)) throw new TestError("Images must be PNG, JPG, WebP or GIF.");
  if (file.size > MAX_TEST_IMAGE_BYTES) throw new TestError("Images must be under 3 MB.");
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${testId}/${randomUUID()}.${ext}`;
  try {
    await uploadTestImage(path, file);
  } catch (err) {
    throw new TestError(err instanceof Error ? err.message : "Image upload failed.");
  }
  return path;
}

/** Adds a question, or edits one when questionId is set. */
export async function saveQuestionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { test } = await managed(String(formData.get("testId")));
    await assertEditable(test.id);

    const prompt = String(formData.get("prompt") ?? "").trim();
    if (!prompt) return { error: "Write the question" };
    if (prompt.length > 3000) return { error: "The question is too long" };

    const raw = [0, 1, 2, 3, 4, 5].map((i) => String(formData.get(`option${i}`) ?? "").trim());
    const correctIndex = Number(formData.get("correct"));
    const filled = raw.map((text, i) => ({ text, i })).filter((o) => o.text);
    if (filled.length < 2) return { error: "Add at least 2 options" };
    if (filled.some((o) => o.text.length > 500)) return { error: "Options must be under 500 characters" };
    const correctPos = filled.findIndex((o) => o.i === correctIndex);
    if (correctPos < 0) return { error: "Choose which option is right" };
    const options = filled.map((o, n) => ({ id: optionId(n), text: o.text }));
    const explanation = String(formData.get("explanation") ?? "").trim().slice(0, 3000) || null;

    const questionId = String(formData.get("questionId") ?? "");
    const [existing] = questionId
      ? await db.select().from(testQuestions).where(and(eq(testQuestions.id, questionId), eq(testQuestions.testId, test.id)))
      : [];
    if (questionId && !existing) return { error: "Question not found" };

    const newImage = await saveImage(test.id, formData.get("image"));
    const removeImage = formData.get("removeImage") === "on";
    const imagePath = newImage ?? (removeImage ? null : existing?.imagePath ?? null);
    if (existing?.imagePath && existing.imagePath !== imagePath) await deleteTestImages([existing.imagePath]);

    const values = { prompt, options, correctOptionId: optionId(correctPos), explanation, imagePath, updatedAt: new Date() };
    if (existing) {
      await db.update(testQuestions).set(values).where(eq(testQuestions.id, existing.id));
    } else {
      await db.insert(testQuestions).values({ ...values, testId: test.id, position: await nextPosition(test.id) });
    }
    refresh(test.id);
    return { ok: existing ? "Question saved" : "Question added" };
  } catch (err) {
    if (err instanceof TestError) return { error: err.message };
    throw err;
  }
}

export async function bulkAddQuestionsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const { test } = await managed(String(formData.get("testId")));
    await assertEditable(test.id);
    const { questions, errors } = parseBulkQuestions(String(formData.get("text") ?? ""));
    if (errors.length) return { errors };
    if (questions.length > 200) return { error: "Paste at most 200 questions at a time" };
    const start = await nextPosition(test.id);
    await db.insert(testQuestions).values(questions.map((q, i) => ({ ...q, testId: test.id, position: start + i })));
    refresh(test.id);
    return { ok: `Added ${questions.length} question${questions.length === 1 ? "" : "s"}` };
  } catch (err) {
    if (err instanceof TestError) return { error: err.message };
    throw err;
  }
}

/* Plain form actions below report back through ?notice= on the test page. */

function back(testId: string, notice: string): never {
  refresh(testId);
  redirect(`/dashboard/tests/${testId}?notice=${encodeURIComponent(notice)}`);
}

export async function deleteQuestionAction(formData: FormData) {
  const { test } = await managed(String(formData.get("testId")));
  if ((await attemptCount(test.id)) > 0) back(test.id, "Students have started this test, so questions can't be removed.");
  const id = z.string().uuid().parse(formData.get("questionId"));
  const [q] = await db.delete(testQuestions).where(and(eq(testQuestions.id, id), eq(testQuestions.testId, test.id))).returning();
  if (q?.imagePath) await deleteTestImages([q.imagePath]);
  back(test.id, "Question removed.");
}

export async function moveQuestionAction(formData: FormData) {
  const { test } = await managed(String(formData.get("testId")));
  if ((await attemptCount(test.id)) > 0) back(test.id, "Students have started this test, so questions can't be moved.");
  const id = String(formData.get("questionId"));
  const dir = formData.get("dir") === "up" ? -1 : 1;
  const list = await listQuestions(test.id);
  const i = list.findIndex((q) => q.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) back(test.id, "");
  [list[i], list[j]] = [list[j], list[i]];
  for (const [pos, q] of list.entries()) {
    if (q.position !== pos) await db.update(testQuestions).set({ position: pos }).where(eq(testQuestions.id, q.id));
  }
  refresh(test.id);
}

export async function publishTestAction(formData: FormData) {
  const { me, test } = await managed(String(formData.get("testId")));
  if (test.publishedAt) {
    if ((await attemptCount(test.id)) > 0) back(test.id, "Students have started this test, so it can't be hidden now.");
    await db.update(tests).set({ publishedAt: null, updatedBy: me.id, updatedAt: new Date() }).where(eq(tests.id, test.id));
    back(test.id, "Hidden from students. It's a draft again.");
  }
  if ((await listQuestions(test.id)).length === 0) back(test.id, "Add at least one question before publishing.");
  if (test.closesAt <= new Date()) back(test.id, "The closing time has passed. Change it before publishing.");
  await db.update(tests).set({ publishedAt: new Date(), updatedBy: me.id, updatedAt: new Date() }).where(eq(tests.id, test.id));
  back(test.id, "Published. Students in the batch can see it.");
}

export async function deleteTestAction(formData: FormData) {
  const { test } = await managed(String(formData.get("testId")));
  if ((await attemptCount(test.id)) > 0) back(test.id, "Students have taken this test, so it can't be deleted.");
  const paths = (await listQuestions(test.id)).map((q) => q.imagePath).filter((p): p is string => !!p);
  await db.delete(tests).where(eq(tests.id, test.id));
  await deleteTestImages(paths);
  revalidatePath("/dashboard/tests");
  redirect("/dashboard/tests");
}
