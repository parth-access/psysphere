import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { batches } from "@/db/schema/core/batches";
import { enrollments } from "@/db/schema/core/enrollments";

type Viewer = { id: string; role: string };

/** Batches a viewer may see: admin = all, teacher = assigned, student = enrolled. */
export async function visibleBatchIds(viewer: Viewer): Promise<string[] | "all"> {
  if (viewer.role === "admin") return "all";
  if (viewer.role === "teacher") {
    const rows = await db.select({ id: batches.id }).from(batches).where(eq(batches.teacherId, viewer.id));
    return rows.map((r) => r.id);
  }
  const rows = await db
    .select({ id: enrollments.batchId })
    .from(enrollments)
    .where(and(eq(enrollments.studentProfileId, viewer.id), eq(enrollments.status, "active")));
  return rows.map((r) => r.id);
}

export async function canAccessBatch(viewer: Viewer, batchId: string) {
  const ids = await visibleBatchIds(viewer);
  return ids === "all" || ids.includes(batchId);
}

/** Teachers may only manage their own batches; admins any. */
export async function canManageBatch(viewer: Viewer, batchId: string) {
  if (viewer.role === "admin") return true;
  if (viewer.role !== "teacher") return false;
  const [b] = await db.select({ teacherId: batches.teacherId }).from(batches).where(eq(batches.id, batchId));
  return b?.teacherId === viewer.id;
}
