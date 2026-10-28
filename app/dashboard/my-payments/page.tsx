import Link from "next/link";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { listPayments } from "@/src/domains/joining/payments";
import { formatIST } from "@/lib/ids";
import { getSettings, whatsappLink } from "@/src/domains/settings/service";

export const dynamic = "force-dynamic";
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default async function MyPaymentsPage() {
  const me = await enforcePageRole([ROLES.STUDENT]);
  const renewLink = whatsappLink(await getSettings(), "Hi, I'd like to renew my Saarthi Classes plan.");
  const payments = await listPayments({ profileId: me.id, email: me.email });

  return (
    <div className="space-y-6">
      <PageHeader title="Fees & payments" description="Your plans and receipts." />
      <DashboardCard>
        {payments.length === 0 ? (
          <p className="text-sm text-ink-500">No payments yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {payments.map(({ r, batchName }) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">{r.planName}</p>
                  <p className="text-sm text-ink-500">{batchName} · paid {formatIST(r.paidAt, { dateStyle: "medium" })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-serif text-xl text-ink-900">{inr(r.amountInr)}</span>
                  <Link href={`/dashboard/my-payments/${r.id}`} className="inline-flex min-h-10 items-center rounded-xl border border-line px-4 text-sm font-semibold text-ink-900 hover:bg-paper">Receipt</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>
      <p className="text-sm text-ink-500">
        Need to renew or change your plan? <a className="font-semibold text-ink-900 underline" href={renewLink} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a> or choose a new plan on the <Link className="font-semibold text-ink-900 underline" href="/join">Join page</Link>.
      </p>
    </div>
  );
}
