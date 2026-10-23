import Link from "next/link";
import { CalendarDays, IndianRupee, MessageSquare, Sparkles, UserPlus } from "lucide-react";
import type { ActivityItem, AdminOverview } from "@/src/domains/admin/overview";
import { formatIST } from "@/lib/ids";

export function NextWorkshopCard({ workshop }: { workshop: AdminOverview["nextWorkshop"] }) {
  if (!workshop) {
    return (
      <section className="rounded-[28px] bg-lilac p-6 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-700">Next free workshop</p>
        <p className="mt-2 font-serif text-2xl leading-tight text-ink-900">Nothing scheduled</p>
        <p className="mt-1 text-sm text-ink-700">Schedule one so new students can try a class.</p>
        <Link
          href="/dashboard/workshops"
          className="mt-4 inline-flex min-h-10 items-center rounded-full bg-forest-800 px-4 text-sm font-semibold text-paper hover:bg-forest-900"
        >
          Schedule one
        </Link>
      </section>
    );
  }
  const ratio = workshop.capacity ? Math.min(1, workshop.registrations / workshop.capacity) : null;
  return (
    <section className="rounded-[28px] bg-lilac p-6 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-700">Next free workshop</p>
      <p className="mt-2 font-serif text-2xl leading-tight text-ink-900">{workshop.title}</p>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-700">
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        {formatIST(workshop.startsAt, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
      </p>
      <p className="mt-4 text-sm text-ink-700">
        <strong className="text-lg font-semibold text-ink-900">{workshop.registrations}</strong> signed up
        {workshop.capacity ? ` of ${workshop.capacity} seats` : ""}
      </p>
      {ratio !== null && (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface/70" aria-hidden="true">
          <div className="h-full rounded-full bg-forest-700" style={{ width: `${ratio * 100}%` }} />
        </div>
      )}
      <Link href={`/dashboard/workshops/${workshop.id}`} className="mt-4 inline-block text-sm font-semibold text-forest-800 hover:underline">
        Manage workshop
      </Link>
    </section>
  );
}

const KIND_ICON = { request: UserPlus, payment: IndianRupee, message: MessageSquare, workshop: Sparkles } as const;

function ago(at: Date, now: Date) {
  const mins = Math.round((now.getTime() - at.getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return formatIST(at, { day: "numeric", month: "short" });
}

export function ActivityCard({ items, now }: { items: ActivityItem[]; now: Date }) {
  return (
    <section aria-labelledby="activity-title" className="rounded-[28px] border border-line bg-surface p-6 sm:p-7">
      <h2 id="activity-title" className="mb-4 font-serif text-2xl text-ink-900">
        Recent activity
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-ink-500">Sign-ups, requests, payments and messages will show up here.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((a) => {
            const Icon = KIND_ICON[a.kind];
            return (
              <li key={a.id}>
                <Link href={a.href} className="-mx-2 flex items-start gap-3 rounded-2xl p-2 hover:bg-paper">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      a.kind === "payment" ? "bg-butter text-gold-700" : "bg-forest-50 text-forest-800"
                    }`}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink-900">{a.text}</span>
                    <span className="block text-xs text-ink-500">{ago(a.at, now)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
