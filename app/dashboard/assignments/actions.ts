"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { assignments } from "@/db/schema/academic/assignments";
import { assignmentAttempts } from "@/db/schema/academic/assignmentAttempts";
import { evaluations } from "@/db/schema/academic/evaluations";
import { requireRole } from "@/server/authorization/requireRole";
import { canAccessBatch, canManageBatch } from "@/server/authorization/access";
import { blockedFor, hit, waitText } from "@/server/security/rateLimit";
import { checkUploadedFile, createUploadTicket, deleteFiles, newFilePath } from "@/src/domains/assignments/storage";
import { MAX_ANSWER_BYTES, MAX_QUESTION_BYTES } from "@/src/domains/assignments/limits";
import { isClosed } from "@/src/domains/assignments/status";

/** `fileRejected`: the upload failed its checks and is gone, so a retry has to send the file again. */
export type FormState = { ok?: string; error?: string; values?: Record<string, string>; fileRejected?: boolean };

const typed = (formData: FormData) =>
  Object.fromEntries([...formData].filter((e): e is [string, string] => typeof e[1] === "string"));
const firstIssue = (e: z.ZodError) => e.issues[0]?.message ?? "Please check the form and try again.";

/* ---------------- Files ---------------- */

const uploadSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("question"), batchId: z.string().uuid() }),
  z.object({ role: z.literal("answer"), assignmentId: z.string().uuid() }),
  z.object({ role: z.literal("checked"), attemptId: z.string().uuid() }),
]);
export type UploadRequest = z.infer<typeof uploadSchema>;

const questionFolder = (batchId: string) => `questions/${batchId}`;
const answerFolder = (assignmentId: string, studentId: string) => `answers/${assignmentId}/${studentId}`;
const checkedFolder = (assignmentId: string, attemptId: string) => `checked/${assignmentId}/${attemptId}`;

/** Checks the person may upload here, and only then hands out a ticket for a path the server chose. */
export async function prepareUploadAction(request: UploadRequest): Promise<{ path: string; token: string } | { error: string }> {
  const me = await requireRole(["admin", "teacher", "student"]);
  const req = uploadSchema.parse(request);

  const limit = [{ key: `assignment-upload:${me.id}`, max: 60, windowMs: 60 * 60_000 }];
  const wait = await blockedFor(limit);
  if (wait > 0) return { error: `That's a lot of uploads. Please try again in ${waitText(wait)}.` };

  let folder: string;
  if (req.role === "question") {
    if (!(await canManageBatch(me, req.batchId))) return { error: "You can only set work for your own batches." };
    folder = questionFolder(req.batchId);
  } else if (req.role === "answer") {
    const open = await openForStudent(me, req.assignmentId);
    if ("error" in open) return open;
    folder = answerFolder(req.assignmentId, me.id);
  } else {
    const [row] = await db
      .select({ attempt: assignmentAttempts, a: assignments })
      .from(assignmentAttempts)
      .innerJoin(assignments, eq(assignments.id, assignmentAttempts.assignmentId))
      .where(eq(assignmentAttempts.id, req.attemptId));
    if (!row || !(await canManageBatch(me, row.a.batchId))) return { error: "Not allowed." };
    folder = checkedFolder(row.a.id, row.attempt.id);
  }

  await hit(limit);
  return createUploadTicket(newFilePath(folder));
}

type Accepted = { path: string; name: string; bytes: number };

/** The file a form says it uploaded, or null if it sent none. It must sit in the folder its ticket was for, and pass the checks. */
async function acceptFile(values: Record<string, string>, folder: string, maxBytes: number): Promise<Accepted | null | { error: string }> {
  const path = values.filePath;
  if (!path) return null;
  const inFolder = path.startsWith(`${folder}/`) && /^[0-9a-f-]{36}\.pdf$/.test(path.slice(folder.length + 1));
  if (!inFolder) return { error: "That upload doesn't belong here. Please choose the file again." };
  const checked = await checkUploadedFile(path, maxBytes);
  if ("error" in checked) return checked;
  const name = (values.fileName ?? "").replace(/[^\w.\- ]+/g, "_").slice(-120);
  return { path, name: /\.pdf$/i.test(name) ? name : "assignment.pdf", bytes: checked.bytes };
}

/* ---------------- Setting work ---------------- */

const assignmentFields = {
  title: z.string().trim().min(3, "Give it a title of at least 3 letters").max(150, "Keep the title under 150 letters"),
  instructions: z.string().trim().max(20000, "Pasted questions can be up to 20,000 letters. Upload a PDF for anything longer."),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a due date"),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/, "Pick a due time"),
  maxMarks: z.coerce.number({ message: "Enter the total marks" }).positive("Marks must be more than 0").max(999, "Marks can be up to 999"),
};
const dueAt = (v: { dueDate: string; dueTime: string }) => new Date(`${v.dueDate}T${v.dueTime}:00+05:30`);
const NEEDS_QUESTIONS = "Paste the questions or upload a PDF.";

const createSchema = z.object({ batchId: z.string().uuid("Choose a batch"), ...assignmentFields });

export async function createAssignmentAction(_p: FormState, formData: FormData): Promise<FormState> {
  const me = await requireRole(["admin", "teacher"]);
  const values = typed(formData);
  const parsed = createSchema.safeParse(values);
  if (!parsed.success) return { error: firstIssue(parsed.error), values };
  const v = parsed.data;
  if (!(await canManageBatch(me, v.batchId))) return { error: "You can only set work for your own batches.", values };

  const file = await acceptFile(values, questionFolder(v.batchId), MAX_QUESTION_BYTES);
  if (file && "error" in file) return { error: file.error, values, fileRejected: true };
  if (!v.instructions && !file) return { error: NEEDS_QUESTIONS, values };

  const [row] = await db
    .insert(assignments)
    .values({
      batchId: v.batchId,
      title: v.title,
      instructions: v.instructions,
      questionFilePath: file?.path,
      questionFileName: file?.name,
      questionFileBytes: file?.bytes,
      allowLate: values.allowLate === "on",
      dueAt: dueAt(v),
      maxMarks: String(v.maxMarks),
      publishedAt: new Date(),
      createdBy: me.id,
    })
    .returning({ id: assignments.id });
  revalidatePath("/dashboard/assignments");
  redirect(`/dashboard/assignments/${row.id}`);
}

const updateSchema = z.object({ id: z.string().uuid(), ...assignmentFields });

export async function updateAssignmentAction(_p: FormState, formData: FormData): Promise<FormState> {
  const me = await requireRole(["admin", "teacher"]);
  const values = typed(formData);
  const parsed = updateSchema.safeParse(values);
  if (!parsed.success) return { error: firstIssue(parsed.error), values };
  const v = parsed.data;
  const [a] = await db.select().from(assignments).where(eq(assignments.id, v.id));
  if (!a || !(await canManageBatch(me, a.batchId))) return { error: "Not allowed.", values };

  const file = await acceptFile(values, questionFolder(a.batchId), MAX_QUESTION_BYTES);
  if (file && "error" in file) return { error: file.error, values, fileRejected: true };
  const removing = values.removeFile === "on";
  const keepsOld = !!a.questionFilePath && !removing && !file;
  if (!v.instructions && !file && !keepsOld) return { error: NEEDS_QUESTIONS, values };

  const marks = await db
    .select({ marks: evaluations.marksObtained })
    .from(evaluations)
    .innerJoin(assignmentAttempts, eq(assignmentAttempts.id, evaluations.assignmentAttemptId))
    .where(eq(assignmentAttempts.assignmentId, a.id));
  if (marks.some((m) => Number(m.marks) > v.maxMarks)) return { error: "Some students already have more marks than this. Change their marks first.", values };

  await db
    .update(assignments)
    .set({
      title: v.title,
      instructions: v.instructions,
      allowLate: values.allowLate === "on",
      dueAt: dueAt(v),
      maxMarks: String(v.maxMarks),
      updatedAt: new Date(),
      ...(file || removing
        ? { questionFilePath: file?.path ?? null, questionFileName: file?.name ?? null, questionFileBytes: file?.bytes ?? null }
        : {}),
    })
    .where(eq(assignments.id, a.id));
  if (file || removing) await deleteFiles([a.questionFilePath]);
  revalidatePath("/dashboard/assignments");
  revalidatePath(`/dashboard/assignments/${a.id}`);
  redirect(`/dashboard/assignments/${a.id}`);
}

export async function deleteAssignmentAction(formData: FormData) {
  const me = await requireRole(["admin", "teacher"]);
  const id = z.string().uuid().parse(formData.get("id"));
  const [a] = await db.select().from(assignments).where(eq(assignments.id, id));
  if (!a || !(await canManageBatch(me, a.batchId))) throw new Error("Not allowed");
  const files = await db
    .select({ answer: assignmentAttempts.filePath, checked: evaluations.checkedFilePath })
    .from(assignmentAttempts)
    .leftJoin(evaluations, eq(evaluations.assignmentAttemptId, assignmentAttempts.id))
    .where(eq(assignmentAttempts.assignmentId, id));
  await db.delete(assignments).where(eq(assignments.id, id));
  await deleteFiles([a.questionFilePath, ...files.flatMap((f) => [f.answer, f.checked])]);
  revalidatePath("/dashboard/assignments");
  redirect("/dashboard/assignments");
}

/* ---------------- Answering ---------------- */

/** Whether this student may still hand in or change an answer, with their current one if so. */
async function openForStudent(
  me: { id: string; role: string },
  assignmentId: string
): Promise<{ error: string } | { a: typeof assignments.$inferSelect; attempt?: typeof assignmentAttempts.$inferSelect }> {
  const [a] = await db.select().from(assignments).where(eq(assignments.id, assignmentId));
  if (!a || !(await canAccessBatch(me, a.batchId))) return { error: "Assignment not found." };
  if (a.resultsPublishedAt) return { error: "Results are out, so this is closed." };
  if (isClosed(a)) return { error: "The due date has passed and this assignment doesn't take late work." };

  const [existing] = await db
    .select({ attempt: assignmentAttempts, ev: evaluations })
    .from(assignmentAttempts)
    .leftJoin(evaluations, eq(evaluations.assignmentAttemptId, assignmentAttempts.id))
    .where(and(eq(assignmentAttempts.assignmentId, a.id), eq(assignmentAttempts.studentProfileId, me.id)))
    .limit(1);
  // Otherwise the marks would stay on an answer the teacher never saw.
  if (existing?.ev) return { error: "Your teacher has checked this, so it can't be changed now." };
  return { a, attempt: existing?.attempt };
}

const answerSchema = z.object({
  assignmentId: z.string().uuid(),
  content: z.string().trim().max(20000, "Typed answers can be up to 20,000 letters. Upload a PDF for anything longer."),
});

export async function submitAnswerAction(_p: FormState, formData: FormData): Promise<FormState> {
  const me = await requireRole(["student"]);
  const values = typed(formData);
  const parsed = answerSchema.safeParse(values);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const v = parsed.data;

  const open = await openForStudent(me, v.assignmentId);
  if ("error" in open) return open;
  const { a, attempt } = open;

  const file = await acceptFile(values, answerFolder(a.id, me.id), MAX_ANSWER_BYTES);
  if (file && "error" in file) return { error: file.error, fileRejected: true };
  const removing = values.removeFile === "on";
  const keepsOld = !!attempt?.filePath && !removing && !file;
  if (!v.content && !file && !keepsOld) return { error: "Type your answer or add a file." };

  const fileColumns = file || removing
    ? { filePath: file?.path ?? null, fileName: file?.name ?? null, fileBytes: file?.bytes ?? null }
    : {};
  const now = new Date();
  if (attempt) {
    await db
      .update(assignmentAttempts)
      .set({ submissionContent: v.content, ...fileColumns, status: "resubmitted", submittedAt: now, updatedAt: now })
      .where(eq(assignmentAttempts.id, attempt.id));
    if (file || removing) await deleteFiles([attempt.filePath]);
  } else {
    await db.insert(assignmentAttempts).values({
      assignmentId: a.id,
      studentProfileId: me.id,
      attemptNumber: 1,
      status: "submitted",
      submittedAt: now,
      submissionContent: v.content,
      ...fileColumns,
    });
  }
  revalidatePath(`/dashboard/assignments/${a.id}`);
  revalidatePath("/dashboard/assignments");
  return { ok: attempt ? "Your answer is updated." : "Submitted. You can change it until your teacher checks it." };
}

/* ---------------- Checking ---------------- */

const marksSchema = z.object({
  attemptId: z.string().uuid(),
  marks: z.string().trim().min(1, "Enter the marks").transform(Number).pipe(z.number({ message: "Marks must be a number" }).min(0, "Marks can't be below 0")),
  feedback: z.string().trim().max(5000, "Keep feedback under 5,000 letters").transform((v) => v || null),
});

async function attemptIfManaged(me: { id: string; role: string }, attemptId: string) {
  const [row] = await db
    .select({ attempt: assignmentAttempts, a: assignments, ev: evaluations })
    .from(assignmentAttempts)
    .innerJoin(assignments, eq(assignments.id, assignmentAttempts.assignmentId))
    .leftJoin(evaluations, eq(evaluations.assignmentAttemptId, assignmentAttempts.id))
    .where(eq(assignmentAttempts.id, attemptId));
  return row && (await canManageBatch(me, row.a.batchId)) ? row : null;
}

export async function saveMarksAction(_p: FormState, formData: FormData): Promise<FormState> {
  const me = await requireRole(["admin", "teacher"]);
  const values = typed(formData);
  const parsed = marksSchema.safeParse(values);
  if (!parsed.success) return { error: firstIssue(parsed.error), values };
  const v = parsed.data;
  const row = await attemptIfManaged(me, v.attemptId);
  if (!row) return { error: "Not allowed.", values };
  if (v.marks > Number(row.a.maxMarks)) return { error: `Marks can't be more than ${Number(row.a.maxMarks)}.`, values };

  const file = await acceptFile(values, checkedFolder(row.a.id, row.attempt.id), MAX_ANSWER_BYTES);
  if (file && "error" in file) return { error: file.error, values, fileRejected: true };
  const removing = values.removeFile === "on";
  const fileColumns = file || removing
    ? { checkedFilePath: file?.path ?? null, checkedFileName: file?.name ?? null, checkedFileBytes: file?.bytes ?? null }
    : {};

  const set = { marksObtained: String(v.marks), teacherFeedback: v.feedback, ...fileColumns, evaluatedBy: me.id, evaluatedAt: new Date() };
  await db
    .insert(evaluations)
    .values({ assignmentAttemptId: v.attemptId, ...set })
    .onConflictDoUpdate({ target: evaluations.assignmentAttemptId, set: { ...set, updatedAt: new Date() } });
  if (file || removing) await deleteFiles([row.ev?.checkedFilePath]);
  revalidatePath(`/dashboard/assignments/${row.a.id}`);
  revalidatePath("/dashboard/assignments");
  return { ok: "Saved." };
}

/** Clears the marks and checked copy, so the student can change their answer again. */
export async function reopenAnswerAction(formData: FormData) {
  const me = await requireRole(["admin", "teacher"]);
  const row = await attemptIfManaged(me, z.string().uuid().parse(formData.get("attemptId")));
  if (!row) throw new Error("Not allowed");
  await db.delete(evaluations).where(eq(evaluations.assignmentAttemptId, row.attempt.id));
  await deleteFiles([row.ev?.checkedFilePath]);
  revalidatePath(`/dashboard/assignments/${row.a.id}`);
  revalidatePath("/dashboard/assignments");
}

export async function publishResultsAction(formData: FormData) {
  const me = await requireRole(["admin", "teacher"]);
  const id = z.string().uuid().parse(formData.get("id"));
  const [a] = await db.select().from(assignments).where(eq(assignments.id, id));
  if (!a || !(await canManageBatch(me, a.batchId))) throw new Error("Not allowed");
  await db.update(assignments).set({ resultsPublishedAt: a.resultsPublishedAt ? null : new Date(), updatedAt: new Date() }).where(eq(assignments.id, id));
  revalidatePath(`/dashboard/assignments/${id}`);
  revalidatePath("/dashboard/assignments");
}
