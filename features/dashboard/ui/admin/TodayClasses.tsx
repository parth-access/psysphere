import Link from "next/link";
import { CalendarPlus, Video } from "lucide-react";
import type { TodaySession } from "@/src/domains/admin/overview";
import { formatIST } from "@/lib/ids";

type State = { label: string; className: string; live?: boolean };

function stateOf(s: TodaySession, now: Date, isNext: boolean): State {
  if (s.status === "cancelled") return { label: "Cancelled", className: "bg-rose-100 text-rose-600" };
  if (s.status === "in_progress" || (now >= s.startsAt && now < s.endsAt)) {
    return { label: "Live now", className: "bg-forest-800 text-paper", live: true };
  }
  if (now >= s.endsAt || s.status === "completed") {
    return s.attendanceMarked > 0
      ? { label: "Attendance done", className: "bg-forest-50 text-forest-800" }
      : { label: "Mark attendance", className: "bg-butter text-gold-700" };
  }
  return isNext ? { label: "Up next", className: "bg-lilac text-ink-900" } : { label: "Later", className: "bg-ink-100 text-ink-700" };
}

export function TodayClasses({ sessions, now }: { sessions: TodaySession[]; now: Date }) {
  const nextId = sessions.find((s) => s.status !== "cancelled" && s.startsAt > now)?.id;
  const time = (d: Date) => formatIST(d, { hour: "numeric", minute: "2-digit" });

  return (
    <section aria-labelledby="today-title" className="rounded-[28px] border border-line bg-surface p-6 sm:p-7">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="today-title" className="font-serif text-2xl text-ink-900">
          Today’s classes
        </h2>
        <Link href="/dashboard/classes" className="text-sm font-semibold text-forest-800 hover:underline">
          All classes
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-[20px] bg-paper p-5">
          <p className="text-[15px] text-ink-700">No classes scheduled for today.</p>
          <Link
            href="/dashboard/classes"
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-forest-800 px-4 text-sm font-semibold text-paper hover:bg-forest-900"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Schedule a class
          </Link>
        </div>
      ) : (
        <ol className="flex flex-col">
          {sessions.map((s, i) => {
            const st = stateOf(s, now, s.id === nextId);
            const done = now >= s.endsAt || s.status === "completed";
            return (
              <li key={s.id} className={`grid grid-cols-[64px_1fr] gap-4 py-4 sm:grid-cols-[72px_1fr_auto] ${i > 0 ? "border-t border-line" : ""}`}>
                <div className="text-sm">
                  <p className="font-semibold tabular-nums text-ink-900">{time(s.startsAt)}</p>
                  <p className="tabular-nums text-ink-500">{time(s.endsAt)}</p>
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${st.className}`}>
                      {st.live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" aria-hidden="true" />}
                      {st.label}
                    </span>
                    <span className="text-xs font-medium text-ink-500">{s.batchName}</span>
                  </div>
                  <p className={`truncate font-semibold text-ink-900 ${s.status === "cancelled" ? "line-through decoration-ink-300" : ""}`}>
                    {s.title}
                  </p>
                  <p className="truncate text-sm text-ink-500">
                    {s.topic}
                    {s.teacherName ? ` · ${s.teacherName}` : ""}
                  </p>
                </div>
                <div className="col-span-2 flex gap-2 sm:col-span-1 sm:items-start">
                  {s.status !== "cancelled" && !done && (
                    <a
                      href={s.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-forest-800 px-3.5 text-sm font-semibold text-paper hover:bg-forest-900"
                    >
                      <Video className="h-4 w-4" aria-hidden="true" /> Meet
                    </a>
                  )}
                  {s.status !== "cancelled" && (
                    <Link
                      href={`/dashboard/attendance/${s.id}`}
                      className="inline-flex min-h-9 items-center rounded-full border border-line px-3.5 text-sm font-semibold text-ink-900 hover:border-ink-300"
                    >
                      Attendance
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
