import { desc, eq, inArray, isNull, or, and } from "drizzle-orm";
import { FileText, Download } from "lucide-react";
import { db } from "@/db";
import { studyMaterials } from "@/db/schema/academic/studyMaterials";
import { batches } from "@/db/schema/core/batches";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { visibleBatchIds } from "@/server/authorization/access";
import { formatIST } from "@/lib/ids";
import { uploadMaterialAction, deleteMaterialAction } from "./actions";
import { PendingButton } from "@/features/shared/ui/PendingButton";

export const dynamic = "force-dynamic";

const input = "w-full min-h-11 px-4 border border-line rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink-700/25 focus:border-ink-700";
const label = "text-xs font-semibold text-ink-500 uppercase tracking-wider block mb-1";
const size = (b: number | null) => (b == null ? "" : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export default async function MaterialsPage({ searchParams }: { searchParams: Promise<{ uploaded?: string; error?: string }> }) {
  const me = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);
  const sp = await searchParams;
  const ids = await visibleBatchIds(me);
  const canUpload = me.role !== "student";

  const where = ids === "all" ? undefined : ids.length ? or(isNull(studyMaterials.batchId), inArray(studyMaterials.batchId, ids)) : isNull(studyMaterials.batchId);
  const files = await db
    .select({ m: studyMaterials, batchName: batches.name })
    .from(studyMaterials)
    .leftJoin(batches, eq(batches.id, studyMaterials.batchId))
    .where(where)
    .orderBy(desc(studyMaterials.createdAt))
    .limit(200);

  const myBatches = !canUpload ? [] : await db
    .select({ id: batches.id, name: batches.name })
    .from(batches)
    .where(ids === "all" ? eq(batches.isActive, true) : ids.length ? and(eq(batches.isActive, true), inArray(batches.id, ids)) : eq(batches.id, "00000000-0000-0000-0000-000000000000"));

  return (
    <div className="space-y-6">
      <PageHeader title="Study material" description={canUpload ? "Notes, worksheets and slides for your batches." : "Notes, worksheets and slides from your teacher."} />
      {sp.uploaded && <p role="status" className="rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-600">File shared with students.</p>}
      {sp.error && <p role="alert" className="rounded-xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-600">{sp.error}</p>}

      <div className={`grid gap-8 ${canUpload ? "lg:grid-cols-3" : ""}`}>
        <div className={canUpload ? "lg:col-span-2" : ""}>
          <DashboardCard>
            {files.length === 0 ? (
              <p className="text-sm text-ink-500">Nothing shared yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {files.map(({ m, batchName }) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-4 py-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-900"><FileText className="h-5 w-5" aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900">{m.title}</p>
                      <p className="text-sm text-ink-500">{batchName ?? "All batches"} · {size(m.sizeBytes)} · {formatIST(m.createdAt, { dateStyle: "medium" })}</p>
                      {m.description && <p className="text-sm text-ink-500">{m.description}</p>}
                    </div>
                    <a href={`/api/materials/${m.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-forest-800 px-4 text-sm font-semibold text-paper hover:bg-forest-900">
                      <Download className="h-4 w-4" aria-hidden="true" /> Download
                    </a>
                    {canUpload && (
                      <form action={deleteMaterialAction}>
                        <input type="hidden" name="id" value={m.id} />
                        <PendingButton className="min-h-10 rounded-xl border border-line px-3 text-sm font-semibold text-rose-600 hover:bg-rose-100">Delete</PendingButton>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </div>

        {canUpload && (
          <DashboardCard title="Share a file">
            <form action={uploadMaterialAction} className="space-y-4">
              <div><label htmlFor="title" className={label}>Title</label><input id="title" name="title" required className={input} /></div>
              <div><label htmlFor="description" className={label}>Note (optional)</label><input id="description" name="description" className={input} /></div>
              <div><label htmlFor="batchId" className={label}>Share with</label>
                <select id="batchId" name="batchId" className={input}>
                  {me.role === "admin" && <option value="all">All batches</option>}
                  {myBatches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select></div>
              <div><label htmlFor="file" className={label}>File (PDF, image, Word, PowerPoint · max 20 MB)</label>
                <input id="file" name="file" type="file" required accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.ppt,.pptx,.xlsx,.txt" className="block w-full text-sm text-ink-700 file:mr-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-ink-100 file:px-4 file:font-semibold file:text-ink-900" /></div>
              <PendingButton className="w-full min-h-11 rounded-full bg-forest-800 text-sm font-semibold text-paper hover:bg-forest-900">Upload</PendingButton>
            </form>
          </DashboardCard>
        )}
      </div>
    </div>
  );
}
