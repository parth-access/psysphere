import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { AdminOverview } from "@/src/domains/admin/overview";

const inr = (v: number) => `₹${v.toLocaleString("en-IN")}`;
const compact = (v: number) => (v >= 100_000 ? `₹${(v / 100_000).toFixed(v >= 1_000_000 ? 0 : 1)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}K` : inr(v));

/** Hero figure (fees this month) plus a six-month column chart. One series, so no legend. */
export function FeesCard({ fees }: { fees: AdminOverview["fees"] }) {
  const { months, thisMonth, lastMonth } = fees;
  const max = Math.max(...months.map((m) => m.total), 1);
  const current = months[months.length - 1];
  const previous = months[months.length - 2];
  const change = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;
  const empty = months.every((m) => m.total === 0);

  return (
    <section aria-labelledby="fees-title" className="flex flex-col rounded-[28px] bg-forest-900 p-6 text-paper sm:p-7">
      <h2 id="fees-title" className="text-sm font-medium text-paper/70">
        Fees received in {current.label}
      </h2>
      <p className="mt-2 font-sans text-[clamp(34px,3.4vw,48px)] font-semibold leading-none tracking-tight">{inr(thisMonth)}</p>
      <p className="mt-3 flex flex-wrap items-center gap-x-1.5 text-sm text-paper/80">
        {change === null ? (
          <>No fees in {previous.label} to compare</>
        ) : (
          <>
            {change >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-mint" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-peach" aria-hidden="true" />
            )}
            <span className="font-semibold text-paper">
              {change >= 0 ? "Up" : "Down"} {Math.abs(change)}%
            </span>
            <span>on {previous.label}</span>
          </>
        )}
      </p>

      <div className="mt-auto flex flex-1 flex-col justify-end pt-8">
        {empty ? (
          <p className="border-t border-paper/15 pt-4 text-sm text-paper/60">No fees received in the last six months yet.</p>
        ) : (
          <div className="flex min-h-[132px] flex-1 items-end gap-2 border-b border-paper/15" aria-hidden="true">
            {months.map((m, i) => {
              const isCurrent = i === months.length - 1;
              const h = m.total === 0 ? 0 : Math.max(4, Math.round((m.total / max) * 82));
              return (
                <div
                  key={m.label}
                  tabIndex={0}
                  className="group relative flex h-full flex-1 flex-col items-center justify-end rounded-md outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  {isCurrent && m.total > 0 && (
                    <span className="mb-1 text-[11px] font-semibold text-paper">{compact(m.total)}</span>
                  )}
                  <span
                    className={`w-full max-w-6 rounded-t-[4px] transition-opacity group-hover:opacity-80 ${isCurrent ? "bg-gold-400" : "bg-paper/40"}`}
                    style={{ height: `${h}%` }}
                  />
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-paper px-2.5 py-1.5 text-xs text-ink-500 opacity-0 shadow-soft transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <strong className="block text-sm text-ink-900">{inr(m.total)}</strong>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {!empty && (
          <div className="mt-2 flex gap-2 text-center text-[11px] text-paper/60" aria-hidden="true">
            {months.map((m) => (
              <span key={m.label} className="flex-1">
                {m.label}
              </span>
            ))}
          </div>
        )}
        <table className="sr-only">
          <caption>Fees received per month</caption>
          <tbody>
            {months.map((m) => (
              <tr key={m.label}>
                <th scope="row">{m.label}</th>
                <td>{inr(m.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
