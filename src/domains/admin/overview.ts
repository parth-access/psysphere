import { and, asc, count, desc, eq, gte, inArray, isNotNull, isNull, lt, ne, notExists, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { istDayStart } from "@/lib/ids";
import { joinRequests } from "@/db/schema/core/joinRequests";
import { batches } from "@/db/schema/core/batches";
import { enrollments } from "@/db/schema/core/enrollments";
import { profiles } from "@/db/schema/core/profiles";
import { contactMessages } from "@/db/schema/core/contactMessages";
import { workshops, workshopRegistrations } from "@/db/schema/core/workshops";
import { classSessions } from "@/db/schema/academic/classSessions";
import { attendance } from "@/db/schema/academic/attendance";
import { assignmentAttempts } from "@/db/schema/academic/assignmentAttempts";
import { evaluations } from "@/db/schema/academic/evaluations";

const DAY = 86_400_000;
const IST_OFFSET = 330 * 60_000;

export { istDayStart };

/** First instant of the IST calendar month `monthsAgo` months before `d`. */
export function istMonthStart(d: Date, monthsAgo = 0) {
  const ist = new Date(d.getTime() + IST_OFFSET);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth() - monthsAgo, 1) - IST_OFFSET);
}

const monthLabel = (d: Date) => d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", month: "short" });
const PAID = ["paid", "enrolled"] as const;

export type AttentionItem = {
  id: "approve" | "unpaid" | "expired" | "provisioning" | "messages" | "grading" | "attendance";
  count: number;
  label: string;
  detail?: string;
  href: string;
  tone: "action" | "warning";
};

export type TodaySession = {
  id: string;
  title: string;
  topic: string;
  batchName: string;
  teacherName: string | null;
  startsAt: Date;
  endsAt: Date;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  meetingUrl: string;
  attendanceMarked: number;
};

export type BatchFill = {
  id: string;
  name: string;
  classLevel: "class_11" | "class_12";
  teacherName: string | null;
  enrolled: number;
  capacity: number | null;
  acceptingStudents: boolean;
};

export type ActivityItem = {
  id: string;
  kind: "request" | "payment" | "message" | "workshop";
  text: string;
  at: Date;
  href: string;
};

export type AdminOverview = {
  now: Date;
  attention: AttentionItem[];
  fees: { months: { label: string; total: number }[]; thisMonth: number; lastMonth: number };
  students: { active: number; newThisMonth: number };
  seats: { filled: number; capacity: number };
  classesNext7Days: number;
  today: TodaySession[];
  funnel: { signups: number; requests: number; approved: number; paid: number };
  batches: BatchFill[];
  nextWorkshop: { id: string; title: string; startsAt: Date; registrations: number; capacity: number | null } | null;
  activity: ActivityItem[];
};

const n = (rows: { n: number | string }[]) => Number(rows[0]?.n ?? 0);

export async function getAdminOverview(now = new Date()): Promise<AdminOverview> {
  const dayStart = istDayStart(now);
  const dayEnd = new Date(dayStart.getTime() + DAY);
  const monthStart = istMonthStart(now);
  const sixMonthsStart = istMonthStart(now, 5);
  const in48h = new Date(now.getTime() + 2 * DAY);
  const weekAgo = new Date(now.getTime() - 7 * DAY);
  const weekAhead = new Date(now.getTime() + 7 * DAY);
  const monthAgo = new Date(now.getTime() - 30 * DAY);
  const teacher = alias(profiles, "teacher");

  const [
    pending,
    oldestPending,
    unpaid,
    expiringSoon,
    expired,
    provisioning,
    unread,
    ungraded,
    noAttendance,
    activeStudents,
    newStudents,
    payments,
    batchRows,
    todayRows,
    next7,
    signups,
    requests,
    approved,
    paid,
    workshopRows,
    recentRequests,
    recentMessages,
    recentSignups,
  ] = await Promise.all([
    db.select({ n: count() }).from(joinRequests).where(eq(joinRequests.status, "pending")),
    db.select({ at: joinRequests.createdAt }).from(joinRequests).where(eq(joinRequests.status, "pending")).orderBy(asc(joinRequests.createdAt)).limit(1),
    db.select({ n: count() }).from(joinRequests).where(and(eq(joinRequests.status, "approved"), gte(joinRequests.payTokenExpiresAt, now))),
    db.select({ n: count() }).from(joinRequests).where(and(eq(joinRequests.status, "approved"), gte(joinRequests.payTokenExpiresAt, now), lt(joinRequests.payTokenExpiresAt, in48h))),
    db.select({ n: count() }).from(joinRequests).where(and(eq(joinRequests.status, "approved"), lt(joinRequests.payTokenExpiresAt, now))),
    db.select({ n: count() }).from(joinRequests).where(and(eq(joinRequests.status, "paid"), isNotNull(joinRequests.provisioningError))),
    db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.isHandled, false)),
    db
      .select({ n: count() })
      .from(assignmentAttempts)
      .leftJoin(evaluations, eq(evaluations.assignmentAttemptId, assignmentAttempts.id))
      .where(and(inArray(assignmentAttempts.status, ["submitted", "resubmitted"]), isNull(evaluations.evaluatedAt))),
    db
      .select({ n: count() })
      .from(classSessions)
      .where(
        and(
          gte(classSessions.endsAt, weekAgo),
          lt(classSessions.endsAt, now),
          ne(classSessions.status, "cancelled"),
          notExists(db.select({ x: sql`1` }).from(attendance).where(eq(attendance.sessionId, classSessions.id)))
        )
      ),
    db.select({ n: count() }).from(profiles).where(and(eq(profiles.role, "student"), eq(profiles.isActive, true))),
    db.select({ n: count() }).from(joinRequests).where(and(eq(joinRequests.status, "enrolled"), gte(joinRequests.enrolledAt, monthStart))),
    db
      .select({ paidAt: joinRequests.paidAt, amount: joinRequests.amountInr })
      .from(joinRequests)
      .where(and(inArray(joinRequests.status, [...PAID]), gte(joinRequests.paidAt, sixMonthsStart))),
    db
      .select({
        id: batches.id,
        name: batches.name,
        classLevel: batches.classLevel,
        capacity: batches.capacity,
        acceptingStudents: batches.acceptingStudents,
        teacherName: teacher.fullName,
        enrolled: sql<number>`count(${enrollments.id}) filter (where ${enrollments.status} = 'active')`,
      })
      .from(batches)
      .leftJoin(teacher, eq(teacher.id, batches.teacherId))
      .leftJoin(enrollments, eq(enrollments.batchId, batches.id))
      .where(eq(batches.isActive, true))
      .groupBy(batches.id, teacher.fullName)
      .orderBy(asc(batches.name)),
    db
      .select({
        id: classSessions.id,
        title: classSessions.title,
        topic: classSessions.topicTitle,
        startsAt: classSessions.startsAt,
        endsAt: classSessions.endsAt,
        status: classSessions.status,
        meetingUrl: classSessions.meetingUrl,
        batchName: batches.name,
        teacherName: teacher.fullName,
        // Table names spelled out: Drizzle drops qualifiers in raw SQL when a query has no joins.
        attendanceMarked: sql<number>`(select count(*) from "attendance" where "attendance"."session_id" = "class_sessions"."id")`,
      })
      .from(classSessions)
      .innerJoin(batches, eq(batches.id, classSessions.batchId))
      .leftJoin(teacher, eq(teacher.id, classSessions.teacherId))
      .where(and(gte(classSessions.startsAt, dayStart), lt(classSessions.startsAt, dayEnd)))
      .orderBy(asc(classSessions.startsAt)),
    db
      .select({ n: count() })
      .from(classSessions)
      .where(and(gte(classSessions.startsAt, now), lt(classSessions.startsAt, weekAhead), eq(classSessions.status, "scheduled"))),
    db.select({ n: count() }).from(workshopRegistrations).where(gte(workshopRegistrations.createdAt, monthAgo)),
    db.select({ n: count() }).from(joinRequests).where(gte(joinRequests.createdAt, monthAgo)),
    db
      .select({ n: count() })
      .from(joinRequests)
      .where(and(gte(joinRequests.createdAt, monthAgo), or(isNotNull(joinRequests.approvedAt), isNotNull(joinRequests.paidAt)))),
    db.select({ n: count() }).from(joinRequests).where(and(gte(joinRequests.createdAt, monthAgo), isNotNull(joinRequests.paidAt))),
    db
      .select({
        id: workshops.id,
        title: workshops.title,
        startsAt: workshops.startsAt,
        capacity: workshops.capacity,
        registrations: sql<number>`(select count(*) from "workshop_registrations" where "workshop_registrations"."workshop_id" = "workshops"."id")`,
      })
      .from(workshops)
      .where(gte(workshops.startsAt, now))
      .orderBy(asc(workshops.startsAt))
      .limit(1),
    db
      .select({ id: joinRequests.id, name: joinRequests.studentName, status: joinRequests.status, amount: joinRequests.amountInr, at: joinRequests.updatedAt })
      .from(joinRequests)
      .orderBy(desc(joinRequests.updatedAt))
      .limit(8),
    db.select({ id: contactMessages.id, name: contactMessages.name, topic: contactMessages.topic, at: contactMessages.createdAt }).from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(5),
    db
      .select({ id: workshopRegistrations.id, name: workshopRegistrations.studentName, title: workshops.title, at: workshopRegistrations.createdAt })
      .from(workshopRegistrations)
      .innerJoin(workshops, eq(workshops.id, workshopRegistrations.workshopId))
      .orderBy(desc(workshopRegistrations.createdAt))
      .limit(5),
  ]);

  /* Things that need the admin, most urgent first. Zero-count items are dropped. */
  const pendingCount = n(pending);
  const oldestDays = oldestPending[0] ? Math.floor((now.getTime() - oldestPending[0].at.getTime()) / DAY) : 0;
  const attention: AttentionItem[] = (
    [
      {
        id: "provisioning",
        count: n(provisioning),
        label: `paid but ${n(provisioning) === 1 ? "their account wasn’t" : "accounts weren’t"} created`,
        detail: "Retry from the Paid tab",
        href: "/dashboard/join-requests?tab=paid",
        tone: "warning",
      },
      {
        id: "approve",
        count: pendingCount,
        label: pendingCount === 1 ? "join request to approve" : "join requests to approve",
        detail: oldestDays > 0 ? `Oldest has waited ${oldestDays} day${oldestDays === 1 ? "" : "s"}` : "Arrived today",
        href: "/dashboard/join-requests?tab=pending",
        tone: "action",
      },
      {
        id: "unpaid",
        count: n(unpaid),
        label: "approved, waiting to pay",
        detail: n(expiringSoon) > 0 ? `${n(expiringSoon)} link${n(expiringSoon) === 1 ? "" : "s"} expire in the next 2 days` : undefined,
        href: "/dashboard/join-requests?tab=approved",
        tone: n(expiringSoon) > 0 ? "warning" : "action",
      },
      {
        id: "expired",
        count: n(expired),
        label: n(expired) === 1 ? "payment link expired" : "payment links expired",
        detail: "Follow up or decline",
        href: "/dashboard/join-requests?tab=approved",
        tone: "warning",
      },
      { id: "messages", count: n(unread), label: n(unread) === 1 ? "unread message" : "unread messages", href: "/dashboard/messages", tone: "action" },
      { id: "grading", count: n(ungraded), label: n(ungraded) === 1 ? "submission to mark" : "submissions to mark", href: "/dashboard/assignments", tone: "action" },
      {
        id: "attendance",
        count: n(noAttendance),
        label: n(noAttendance) === 1 ? "class this week without attendance" : "classes this week without attendance",
        href: "/dashboard/attendance",
        tone: "warning",
      },
    ] satisfies AttentionItem[]
  ).filter((a) => a.count > 0);

  /* Fees by IST month, oldest first, including empty months. */
  const months = Array.from({ length: 6 }, (_, i) => {
    const start = istMonthStart(now, 5 - i);
    const end = istMonthStart(now, 4 - i);
    const total = payments
      .filter((p) => p.paidAt && p.paidAt >= start && p.paidAt < end)
      .reduce((s, p) => s + p.amount, 0);
    return { label: monthLabel(start), total };
  });

  const batchFill: BatchFill[] = batchRows.map((b) => ({ ...b, enrolled: Number(b.enrolled) }));
  const withCapacity = batchFill.filter((b) => b.capacity);

  const statusText: Record<string, string> = {
    pending: "asked for a seat",
    approved: "was approved and can pay",
    paid: "paid",
    enrolled: "joined",
    declined: "was declined",
    cancelled: "cancelled their request",
  };
  const inr = (v: number) => `₹${v.toLocaleString("en-IN")}`;
  const activity: ActivityItem[] = [
    ...recentRequests.map((r) => ({
      id: `r-${r.id}`,
      kind: (r.status === "paid" || r.status === "enrolled" ? "payment" : "request") as ActivityItem["kind"],
      text: `${r.name} ${statusText[r.status] ?? r.status}${r.status === "paid" || r.status === "enrolled" ? ` · ${inr(r.amount)}` : ""}`,
      at: r.at,
      href: `/dashboard/join-requests?tab=${r.status === "cancelled" ? "declined" : r.status}`,
    })),
    ...recentMessages.map((m) => ({ id: `m-${m.id}`, kind: "message" as const, text: `${m.name} sent a message about ${m.topic.toLowerCase()}`, at: m.at, href: "/dashboard/messages" })),
    ...recentSignups.map((s) => ({ id: `w-${s.id}`, kind: "workshop" as const, text: `${s.name} signed up for ${s.title}`, at: s.at, href: "/dashboard/workshops" })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  const w = workshopRows[0];

  return {
    now,
    attention,
    fees: { months, thisMonth: months[5].total, lastMonth: months[4].total },
    students: { active: n(activeStudents), newThisMonth: n(newStudents) },
    seats: {
      filled: withCapacity.reduce((s, b) => s + b.enrolled, 0),
      capacity: withCapacity.reduce((s, b) => s + (b.capacity ?? 0), 0),
    },
    classesNext7Days: n(next7),
    today: todayRows.map((t) => ({ ...t, attendanceMarked: Number(t.attendanceMarked) })),
    funnel: { signups: n(signups), requests: n(requests), approved: n(approved), paid: n(paid) },
    batches: batchFill,
    nextWorkshop: w ? { ...w, registrations: Number(w.registrations) } : null,
    activity,
  };
}
