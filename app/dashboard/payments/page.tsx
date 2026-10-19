import Link from "next/link";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { StatCard } from "@/features/dashboard/ui/StatCard";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { listPayments } from "@/src/domains/joining/payments";
import { formatIST } from "@/lib/ids";

export const dynamic = "force-dynamic";
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const monthKey = (d: Date) => d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", month: "long", year: "numeric" });

export default async function PaymentsPage() {
  await enforcePageRole([ROLES.ADMIN]);
  const rows = await listPayments();
  const total = rows.reduce((s, x) => s + x.r.amountInr, 0);
  const thisMonth = monthKey(new Date());
  const monthTotal = rows.filter((x) => x.r.paidAt && monthKey(x.r.paidAt) === thisMonth).reduce((s, x) => s + x.r.amountInr, 0);

  const byMonth = new Map<string, typeof rows>();
  for (const x of rows) {
    const k = x.r.paidAt ? monthKey(x.r.paidAt) : "Unknown";
    byMonth.set(k, [...(byMonth.get(k) ?? []), x]);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Every fee paid through Razorpay."
        action={<a href="/api/admin/payments" className="inline-flex min-h-11 items-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink-900 hover:bg-paper">Download CSV</a>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={`Received in ${thisMonth}`} value={inr(monthTotal)} />
        <StatCard label="Received in total" value={inr(total)} />
        <StatCard label="Payments" value={rows.length} />
      </div>
      {rows.length === 0 ? (
        <DashboardCard><p className="text-sm text-ink-500">No payments yet.</p></DashboardCard>
      ) : (
        [...byMonth.entries()].map(([month, items]) => (
          <DashboardCard key={month} title={`${month} · ${inr(items.reduce((s, x) => s + x.r.amountInr, 0))}`}>
            <div className="-mx-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-ink-500">
                    <th className="px-6 py-2 font-semibold">Date</th>
                    <th className="px-3 py-2 font-semibold">Student</th>
                    <th className="px-3 py-2 font-semibold">Plan</th>
                    <th className="px-3 py-2 text-right font-semibold">Amount</th>
                    <th className="px-6 py-2 text-right font-semibold"><span className="sr-only">Receipt</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map(({ r, batchName }) => (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap px-6 py-3 text-ink-500">{formatIST(r.paidAt, { dateStyle: "medium" })}</td>
                      <td className="px-3 py-3"><p className="font-semibold text-ink-900">{r.studentName}</p><p className="text-ink-500">{r.email}</p></td>
                      <td className="px-3 py-3 text-ink-500">{r.planName}<br />{batchName}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-ink-900 tabular-nums">{inr(r.amountInr)}</td>
                      <td className="px-6 py-3 text-right"><Link href={`/dashboard/my-payments/${r.id}`} className="font-semibold text-ink-900 underline">Receipt</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        ))
      )}
    </div>
  );
}
