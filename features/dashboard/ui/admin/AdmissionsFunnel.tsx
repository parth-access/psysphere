import type { AdminOverview } from "@/src/domains/admin/overview";

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : null);

/** Horizontal bars, one hue, value at each tip. Every value is labelled, so no tooltip layer. */
export function AdmissionsFunnel({ funnel }: { funnel: AdminOverview["funnel"] }) {
  const stages = [
    { label: "Workshop sign-ups", value: funnel.signups, note: null },
    { label: "Seat requests", value: funnel.requests, note: null },
    { label: "Approved", value: funnel.approved, note: pct(funnel.approved, funnel.requests) && `${pct(funnel.approved, funnel.requests)} of requests` },
    { label: "Paid", value: funnel.paid, note: pct(funnel.paid, funnel.approved) && `${pct(funnel.paid, funnel.approved)} of approved` },
  ];
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <section aria-labelledby="funnel-title" className="rounded-[28px] border border-line bg-surface p-6 sm:p-7">
      <h2 id="funnel-title" className="font-serif text-2xl text-ink-900">
        Admissions
      </h2>
      <p className="mb-6 text-sm text-ink-500">Last 30 days</p>
      <dl className="flex flex-col gap-4">
        {stages.map((s) => (
          <div key={s.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <dt className="font-medium text-ink-700">{s.label}</dt>
              {s.note && <span className="text-xs text-ink-500">{s.note}</span>}
            </div>
            <dd className="flex items-center gap-2.5">
              <span
                className="h-5 rounded-r-[4px] bg-forest-700"
                style={{ width: s.value === 0 ? "2px" : `${Math.max(3, (s.value / max) * 85)}%` }}
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-ink-900">{s.value}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
