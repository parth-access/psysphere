import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { assignments } from "@/db/schema/academic/assignments";
import { assignmentAttempts } from "@/db/schema/academic/assignmentAttempts";
import { evaluations } from "@/db/schema/academic/evaluations";
import { getProfile } from "@/server/authorization/getProfile";
import { canAccessBatch, canManageBatch } from "@/server/authorization/access";
import { signedFileUrl } from "@/src/domains/assignments/storage";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";

type Viewer = { id: string; role: string };
type Found = { path: string | null; name: string | null };

/** The question paper: anyone in the batch. `id` is the assignment. */
async function questionFile(me: Viewer, id: string): Promise<Found | null> {
  const [a] = await db.select().from(assignments).where(eq(assignments.id, id));
  if (!a || !(await canAccessBatch(me, a.batchId))) return null;
  return { path: a.questionFilePath, name: a.questionFileName };
}

async function attemptFor(id: string) {
  const [row] = await db
    .select({ attempt: assignmentAttempts, a: assignments, ev: evaluations })
    .from(assignmentAttempts)
    .innerJoin(assignments, eq(assignments.id, assignmentAttempts.assignmentId))
    .leftJoin(evaluations, eq(evaluations.assignmentAttemptId, assignmentAttempts.id))
    .where(eq(assignmentAttempts.id, id));
  return row;
}

/** An answer: the student who wrote it and the batch's teacher. `id` is the attempt. */
async function answerFile(me: Viewer, id: string): Promise<Found | null> {
  const row = await attemptFor(id);
  if (!row) return null;
  if (row.attempt.studentProfileId !== me.id && !(await canManageBatch(me, row.a.batchId))) return null;
  return { path: row.attempt.filePath, name: row.attempt.fileName };
}

/** The checked copy: the batch's teacher, and the student only once results are out. `id` is the attempt. */
async function checkedFile(me: Viewer, id: string): Promise<Found | null> {
  const row = await attemptFor(id);
  if (!row) return null;
  const own = row.attempt.studentProfileId === me.id && !!row.a.resultsPublishedAt;
  if (!own && !(await canManageBatch(me, row.a.batchId))) return null;
  return { path: row.ev?.checkedFilePath ?? null, name: row.ev?.checkedFileName ?? null };
}

const KINDS = { question: questionFile, answer: answerFile, checked: checkedFile };

/** Checks the viewer may see the file, then redirects to a 60-second signed link. `?download=1` saves it instead of opening it. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  const me = await getProfile();
  if (!me || !me.isActive) return NextResponse.redirect(new URL("/sign-in", req.url));
  if (!isUuid(id) || !Object.hasOwn(KINDS, kind)) return new NextResponse("Not found", { status: 404 });

  const file = await KINDS[kind as keyof typeof KINDS](me, id);
  if (!file?.path) return new NextResponse("Not found", { status: 404 });

  const url = await signedFileUrl(file.path, file.name ?? "assignment.pdf", { download: req.nextUrl.searchParams.has("download") });
  return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store" } });
}
