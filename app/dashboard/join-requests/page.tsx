import Link from "next/link";
import { desc, eq, count } from "drizzle-orm";
import { db } from "@/db";
import { joinRequests } from "@/db/schema/core/joinRequests";
import { batches } from "@/db/schema/core/batches";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { StatusBadge } from "@/features/dashboard/ui/StatusBadge";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { approveAction, declineAction, retryEnrollAction } from "./actions";
import { PendingButton } from "@/features/shared/ui/PendingButton";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "pending", label: "To approve" },
  { id: "approved", label: "Awaiting payment" },
  { id: "paid", label: "Paid" },
  { id: "enrolled", label: "Enrolled" },
  { id: "declined", label: "Declined" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const btn = "inline-flex min-h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold";

export default async function JoinRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; notice?: string }>;
}) {
  await enforcePageRole([ROLES.ADMIN]);
  const sp = await searchParams;
  const tab: Tab = (TABS.find((t) => t.id === sp.tab)?.id ?? "pending") as Tab;

  const counts = Object.fromEntries(
    (await db.select({ status: joinRequests.status, n: count() }).from(joinRequests).groupBy(joinRequests.status)).map((r) => [r.status, Number(r.n)])
  );

  const rows = await db
    .select({ r: joinRequests, batchName: batches.name })
    .from(joinRequests)
    .innerJoin(batches, eq(batches.id, joinRequests.batchId))
    .where(eq(joinRequests.status, tab))
    .orderBy(desc(joinRequests.updatedAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <PageHeader title="Join requests" description="Students asking for a seat in a batch." />

      <nav aria-label="Request status" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard/join-requests?tab=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ${tab === t.id ? "bg-forest-800 text-paper" : "border border-line bg-white text-ink-900 hover:bg-paper"}`}
          >
            {t.label}
            <span className={`rounded-full px-2 text-xs ${tab === t.id ? "bg-ink-700" : "bg-paper-deep"}`}>{counts[t.id] ?? 0}</span>
          </Link>
        ))}
      </nav>

      {sp.notice && <p role="status" className="rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-600">{sp.notice}</p>}

      <DashboardCard>
        {rows.length === 0 ? (
          <p className="text-sm text-ink-500">Nothing here.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map(({ r, batchName }) => (
              <li key={r.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink-900">{r.studentName}</p>
                    <StatusBadge status={r.status} />
                    {r.workshopId && <span className="rounded-full bg-marigold-100 px-2 py-0.5 text-xs font-semibold text-gold-700">From workshop</span>}
                  </div>
                  <p className="text-sm text-ink-500">{r.email} · {r.phone}</p>
                  <p className="text-sm text-ink-500">Parent: {r.parentName} · {r.parentPhone}</p>
                  <p className="text-sm text-ink-900">{batchName} · {r.planName} · <strong>{inr(r.amountInr)}</strong></p>
                  {r.status === "approved" && r.payTokenExpiresAt && (
                    <p className="text-xs text-ink-500">Link expires {r.payTokenExpiresAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                  )}
                  {r.razorpayPaymentId && <p className="text-xs text-ink-500">Payment {r.razorpayPaymentId}</p>}
                  {r.declineReason && <p className="text-xs text-ink-500">Reason: {r.declineReason}</p>}
                  {r.provisioningError && (
                    <p className="text-xs font-medium text-rose-600">Account setup failed: {r.provisioningError}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  {(r.status === "pending" || r.status === "approved") && (
                    <form action={approveAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <PendingButton className={`${btn} bg-forest-800 text-paper hover:bg-forest-900`}>
                        {r.status === "pending" ? "Approve" : "Resend payment link"}
                      </PendingButton>
                    </form>
                  )}
                  {(r.status === "pending" || r.status === "approved") && (
                    <form action={declineAction} className="flex gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="tab" value={tab} />
                      <label className="sr-only" htmlFor={`reason-${r.id}`}>Reason (optional)</label>
                      <input id={`reason-${r.id}`} name="reason" placeholder="Reason (optional)" className="min-h-9 w-40 rounded-lg border border-line px-2 text-xs" />
                      <PendingButton className={`${btn} border border-line text-rose-600 hover:bg-rose-100`}>Decline</PendingButton>
                    </form>
                  )}
                  {r.status === "paid" && (
                    <form action={retryEnrollAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <PendingButton className={`${btn} bg-forest-800 text-paper hover:bg-forest-900`}>Retry account setup</PendingButton>
                    </form>
                  )}
                  {r.status === "enrolled" && r.studentProfileId && (
                    <Link href={`/dashboard/students/${r.studentProfileId}`} className={`${btn} border border-line text-ink-900 hover:bg-paper`}>View student</Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>
    </div>
  );
}
