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

const createSchema = z.object({
  batchId: z.string().uuid("Choose a batch"),
  title: z.string().trim().min(3).max(150),
  instructions: z.string().trim().min(5).max(5000),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/),
  maxMarks: z.coerce.number().positive().max(999),
});

export async function createAssignmentAction(formData: FormData) {
  const me = await requireRole(["admin", "teacher"]);
  const v = createSchema.parse(Object.fromEntries(formData));
  if (!(await canManageBatch(me, v.batchId))) throw new Error("You can only set work for your own batches.");
  const [row] = await db
    .insert(assignments)
    .values({
      batchId: v.batchId,
      title: v.title,
      instructions: v.instructions,
      dueAt: new Date(`${v.dueDate}T${v.dueTime}:00+05:30`),
      maxMarks: String(v.maxMarks),
      publishedAt: new Date(),
      createdBy: me.id,
    })
    .returning({ id: assignments.id });
  revalidatePath("/dashboard/assignments");
  redirect(`/dashboard/assignments/${row.id}`);
}

const submitSchema = z.object({
  assignmentId: z.string().uuid(),
  content: z.string().trim().min(1, "Write your answer").max(20000),
  attachmentUrl: z.string().trim().url().optional().or(z.literal("")).transform((v) => v || null),
});

export async function submitAssignmentAction(formData: FormData) {
  const me = await requireRole(["student"]);
  const v = submitSchema.parse(Object.fromEntries(formData));
  const [a] = await db.select().from(assignments).where(eq(assignments.id, v.assignmentId));
  if (!a || !(await canAccessBatch(me, a.batchId))) throw new Error("Assignment not found.");
  if (a.resultsPublishedAt) throw new Error("Results are out; submissions are closed.");

  const [existing] = await db
    .select()
    .from(assignmentAttempts)
    .where(and(eq(assignmentAttempts.assignmentId, a.id), eq(assignmentAttempts.studentProfileId, me.id)))
    .limit(1);

  if (existing) {
    await db
      .update(assignmentAttempts)
      .set({ submissionContent: v.content, attachmentUrl: v.attachmentUrl, status: "resubmitted", submittedAt: new Date(), updatedAt: new Date() })
      .where(eq(assignmentAttempts.id, existing.id));
  } else {
    await db.insert(assignmentAttempts).values({
      assignmentId: a.id,
      studentProfileId: me.id,
      attemptNumber: 1,
      status: "submitted",
      submittedAt: new Date(),
      submissionContent: v.content,
      attachmentUrl: v.attachmentUrl,
    });
  }
  revalidatePath(`/dashboard/assignments/${a.id}`);
  redirect(`/dashboard/assignments/${a.id}?submitted=1`);
}

const gradeSchema = z.object({
  attemptId: z.string().uuid(),
  marks: z.coerce.number().min(0),
  feedback: z.string().trim().max(5000).optional().transform((v) => v || null),
});

export async function gradeAction(formData: FormData) {
  const me = await requireRole(["admin", "teacher"]);
  const v = gradeSchema.parse(Object.fromEntries(formData));
  const [row] = await db
    .select({ attempt: assignmentAttempts, a: assignments })
    .from(assignmentAttempts)
    .innerJoin(assignments, eq(assignments.id, assignmentAttempts.assignmentId))
    .where(eq(assignmentAttempts.id, v.attemptId));
  if (!row || !(await canManageBatch(me, row.a.batchId))) throw new Error("Not allowed");
  if (v.marks > Number(row.a.maxMarks)) throw new Error(`Marks can't be more than ${row.a.maxMarks}.`);

  await db
    .insert(evaluations)
    .values({ assignmentAttemptId: v.attemptId, marksObtained: String(v.marks), teacherFeedback: v.feedback, evaluatedBy: me.id, evaluatedAt: new Date() })
    .onConflictDoUpdate({
      target: evaluations.assignmentAttemptId,
      set: { marksObtained: String(v.marks), teacherFeedback: v.feedback, evaluatedBy: me.id, evaluatedAt: new Date(), updatedAt: new Date() },
    });
  revalidatePath(`/dashboard/assignments/${row.a.id}`);
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
