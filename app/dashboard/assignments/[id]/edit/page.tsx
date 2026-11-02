import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { assignments } from "@/db/schema/academic/assignments";
import { assignmentAttempts } from "@/db/schema/academic/assignmentAttempts";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { AssignmentForm } from "@/features/assignments/ui/AssignmentForm";
import { DeleteAssignment } from "@/features/assignments/ui/DeleteAssignment";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { canManageBatch } from "@/server/authorization/access";
import { istInputs } from "@/src/domains/assignments/status";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";

export default async function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER]);
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [a] = await db.select().from(assignments).where(eq(assignments.id, id));
  if (!a || !(await canManageBatch(me, a.batchId))) notFound();
  const submissions = await db.$count(assignmentAttempts, and(eq(assignmentAttempts.assignmentId, a.id)));
  const due = istInputs(a.dueAt);

  return (
    <div className="max-w-2xl space-y-6">
      <Link href={`/dashboard/assignments/${a.id}`} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the assignment
      </Link>
      <h1 className="font-serif text-[32px] text-ink-900">Edit assignment</h1>
      <DashboardCard>
        <AssignmentForm
          batches={[]}
          existing={{
            id: a.id,
            batchId: a.batchId,
            title: a.title,
            instructions: a.instructions,
            dueDate: due.date,
            dueTime: due.time,
            maxMarks: Number(a.maxMarks),
            allowLate: a.allowLate,
            file: a.questionFilePath ? { kind: "question", id: a.id, name: a.questionFileName, bytes: a.questionFileBytes } : null,
          }}
        />
      </DashboardCard>
      <DeleteAssignment id={a.id} submissions={submissions} />
    </div>
  );
}
