import Link from "next/link";
import type { BatchFill } from "@/src/domains/admin/overview";

const CLASS_LABEL = { class_11: "Class 11", class_12: "Class 12" } as const;

/** Seat meters per active batch. Fill turns gold from 90%, always with a text label. */
export function BatchesCard({ batches }: { batches: BatchFill[] }) {
  return (
    <section aria-labelledby="batches-title" className="rounded-[28px] border border-line bg-surface p-6 sm:p-7">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="batches-title" className="font-serif text-2xl text-ink-900">
          Batches
        </h2>
        <Link href="/dashboard/batches" className="text-sm font-semibold text-forest-800 hover:underline">
          Manage batches
        </Link>
      </div>

      {batches.length === 0 ? (
        <p className="rounded-[20px] bg-paper p-5 text-[15px] text-ink-700">
          No active batches yet. <Link href="/dashboard/batches" className="font-semibold text-forest-800 underline">Create one</Link> to start taking students.
        </p>
      ) : (
        <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {batches.map((b) => {
            const ratio = b.capacity ? b.enrolled / b.capacity : 0;
            const full = b.capacity !== null && b.enrolled >= b.capacity;
            const almost = !full && ratio >= 0.9;
            return (
              <li key={b.id}>
                <Link href={`/dashboard/batches/${b.id}`} className="group block">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate font-semibold text-ink-900 group-hover:underline">{b.name}</p>
                    <p className="shrink-0 text-sm text-ink-700">
                      {b.capacity ? (
                        <>
                          <strong className="font-semibold text-ink-900">{b.enrolled}</strong> of {b.capacity}
                        </>
                      ) : (
                        <>
                          <strong className="font-semibold text-ink-900">{b.enrolled}</strong> students
                        </>
                      )}
                    </p>
                  </div>
                  <p className="mb-2 truncate text-xs text-ink-500">
                    {CLASS_LABEL[b.classLevel]}
                    {b.teacherName ? ` · ${b.teacherName}` : ""}
                    {!b.acceptingStudents ? " · Closed to new students" : ""}
                  </p>
                  {b.capacity ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 flex-1 overflow-hidden rounded-full bg-forest-100"
                        role="meter"
                        aria-valuemin={0}
                        aria-valuemax={b.capacity}
                        aria-valuenow={b.enrolled}
                        aria-label={`${b.name} seats filled`}
                      >
                        <div
                          className={`h-full rounded-full ${full || almost ? "bg-gold-600" : "bg-forest-700"}`}
                          style={{ width: `${Math.min(100, ratio * 100)}%` }}
                        />
                      </div>
                      {(full || almost) && (
                        <span className="text-xs font-bold text-gold-700">{full ? "Full" : "Almost full"}</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-500">No seat limit set</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
