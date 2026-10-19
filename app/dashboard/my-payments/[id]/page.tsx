import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { joinRequests } from "@/db/schema/core/joinRequests";
import { batches } from "@/db/schema/core/batches";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { isUuid, formatIST } from "@/lib/ids";
import { SITE } from "@/constants/site";
import { PrintButton } from "@/features/dashboard/ui/PrintButton";

export const dynamic = "force-dynamic";
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await enforcePageRole([ROLES.STUDENT, ROLES.ADMIN]);
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [row] = await db
    .select({ r: joinRequests, batchName: batches.name })
    .from(joinRequests)
    .innerJoin(batches, eq(batches.id, joinRequests.batchId))
    .where(eq(joinRequests.id, id));
  if (!row || !["paid", "enrolled"].includes(row.r.status)) notFound();
  if (me.role === "student" && row.r.studentProfileId !== me.id && row.r.email !== me.email) notFound();
  const r = row.r;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex justify-end print:hidden"><PrintButton /></div>
      <article className="rounded-2xl border border-line bg-surface p-8 print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="font-serif text-2xl font-semibold text-ink-900">Payment receipt</p>
            <p className="text-sm text-ink-500">{SITE.name} · {SITE.email} · {SITE.phone}</p>
          </div>
          <p className="text-sm text-ink-500">Receipt no. {r.id.slice(0, 8).toUpperCase()}</p>
        </header>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 py-6 text-[15px] sm:grid-cols-2">
          <div><dt className="text-ink-500">Student</dt><dd className="font-semibold text-ink-900">{r.studentName}</dd></div>
          <div><dt className="text-ink-500">Email</dt><dd className="text-ink-900">{r.email}</dd></div>
          <div><dt className="text-ink-500">Parent / guardian</dt><dd className="text-ink-900">{r.parentName} · {r.parentPhone}</dd></div>
          <div><dt className="text-ink-500">Batch</dt><dd className="text-ink-900">{row.batchName}</dd></div>
          <div><dt className="text-ink-500">Plan</dt><dd className="text-ink-900">{r.planName}</dd></div>
          <div><dt className="text-ink-500">Paid on</dt><dd className="text-ink-900">{formatIST(r.paidAt)}</dd></div>
          <div><dt className="text-ink-500">Razorpay payment ID</dt><dd className="font-mono text-sm text-ink-900">{r.razorpayPaymentId}</dd></div>
          <div><dt className="text-ink-500">Order ID</dt><dd className="font-mono text-sm text-ink-900">{r.razorpayOrderId}</dd></div>
        </dl>
        <div className="flex items-baseline justify-between border-t border-line pt-6">
          <span className="text-ink-500">Amount paid</span>
          <span className="font-serif text-3xl font-semibold text-ink-900">{inr(r.amountInr)}</span>
        </div>
      </article>
    </div>
  );
}
