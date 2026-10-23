import Link from "next/link";
import { CalendarClock, CalendarPlus, Armchair, Sparkles, Users } from "lucide-react";
import type { AdminOverview as Data } from "@/src/domains/admin/overview";
import { StatCard } from "@/features/dashboard/ui/StatCard";
import { formatIST } from "@/lib/ids";
import { AttentionCard } from "./AttentionCard";
import { FeesCard } from "./FeesCard";
import { TodayClasses } from "./TodayClasses";
import { AdmissionsFunnel } from "./AdmissionsFunnel";
import { BatchesCard } from "./BatchesCard";
import { ActivityCard, NextWorkshopCard } from "./SideCards";

function greeting(now: Date) {
  const hour = Number(formatIST(now, { hour: "numeric", hour12: false }));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function AdminOverview({ data, name }: { data: Data; name: string }) {
  const { now, seats, students } = data;
  const firstName = name.split(" ")[0];
  const seatPct = seats.capacity > 0 ? Math.round((seats.filled / seats.capacity) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-2">
        <div>
          <p className="text-sm font-semibold text-forest-800">{formatIST(now, { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="mt-1 font-serif text-[40px] leading-[1.05] text-ink-900 sm:text-[48px]">
            {greeting(now)}, <em className="text-forest-800">{firstName}.</em>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/workshops"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink-900 hover:border-ink-300"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" /> New workshop
          </Link>
          <Link
            href="/dashboard/classes"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest-800 px-5 text-sm font-semibold text-paper hover:bg-forest-900"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Schedule a class
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttentionCard items={data.attention} />
        </div>
        <FeesCard fees={data.fees} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active students"
          value={students.active}
          hint={students.newThisMonth > 0 ? `${students.newThisMonth} joined this month` : "None joined this month yet"}
          icon={<Users />}
        />
        <StatCard
          label="Seats filled"
          value={seatPct === null ? "–" : `${seatPct}%`}
          hint={seats.capacity > 0 ? `${seats.filled} of ${seats.capacity} seats` : "No batch has a seat limit"}
          icon={<Armchair />}
        />
        <StatCard label="Classes this week" value={data.classesNext7Days} hint="Scheduled in the next 7 days" icon={<CalendarClock />} />
        <StatCard label="Workshop sign-ups" value={data.funnel.signups} hint="In the last 30 days" icon={<Sparkles />} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <TodayClasses sessions={data.today} now={now} />
          <BatchesCard batches={data.batches} />
        </div>
        <div className="flex flex-col gap-6">
          <AdmissionsFunnel funnel={data.funnel} />
          <NextWorkshopCard workshop={data.nextWorkshop} />
          <ActivityCard items={data.activity} now={now} />
        </div>
      </div>
    </div>
  );
}
