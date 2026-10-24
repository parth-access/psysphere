import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { classSessions } from "@/db/schema/academic/classSessions";
import { attendance } from "@/db/schema/academic/attendance";
import { batches } from "@/db/schema/core/batches";
import { enrollments } from "@/db/schema/core/enrollments";
import { profiles } from "@/db/schema/core/profiles";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { enforcePageRole, requireRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { canManageBatch } from "@/server/authorization/access";
import { isUuid, formatIST } from "@/lib/ids";

export const dynamic = "force-dynamic";

const STATUSES = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
] as const;

async function saveAttendance(formData: FormData) {
  "use server";
  const me = await requireRole(["admin", "teacher"]);
  const sessionId = String(formData.get("sessionId"));
  if (!isUuid(sessionId)) throw new Error("Invalid class");
  const [session] = await db.select().from(classSessions).where(eq(classSessions.id, sessionId));
  if (!session || !(await canManageBatch(me, session.batchId))) throw new Error("Not allowed");

  const roster = await db
    .select({ id: enrollments.studentProfileId })
    .from(enrollments)
    .where(and(eq(enrollments.batchId, session.batchId), eq(enrollments.status, "active")));

  const rows = roster.map((r) => {
    const v = String(formData.get(`s_${r.id}`) || "absent");
    const status = (["present", "absent", "excused"].includes(v) ? v : "absent") as "present" | "absent" | "excused";
    return { sessionId, studentProfileId: r.id, status, markedBy: me.id, markedAt: new Date() };
  });

  if (rows.length) {
    await db.transaction(async (tx) => {
      for (const row of rows) {
        await tx
          .insert(attendance)
          .values(row)
          .onConflictDoUpdate({
            target: [attendance.sessionId, attendance.studentProfileId],
            set: { status: row.status, markedBy: me.id, markedAt: new Date(), updatedAt: new Date() },
          });
      }
      if (session.status === "scheduled" && session.startsAt < new Date()) {
        await tx.update(classSessions).set({ status: "completed", updatedAt: new Date() }).where(eq(classSessions.id, sessionId));
      }
    });
  }
  revalidatePath("/dashboard/attendance");
  redirect(`/dashboard/attendance/${sessionId}?saved=1`);
}

export default async function SessionAttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const me = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER]);
  const { sessionId } = await params;
  const { saved } = await searchParams;
  if (!isUuid(sessionId)) notFound();

  const [row] = await db
    .select({ s: classSessions, batchName: batches.name })
    .from(classSessions)
    .innerJoin(batches, eq(batches.id, classSessions.batchId))
    .where(eq(classSessions.id, sessionId));
  if (!row || !(await canManageBatch(me, row.s.batchId))) notFound();

  const roster = await db
    .select({ id: profiles.id, name: profiles.fullName })
    .from(enrollments)
    .innerJoin(profiles, eq(profiles.id, enrollments.studentProfileId))
    .where(and(eq(enrollments.batchId, row.s.batchId), eq(enrollments.status, "active")))
    .orderBy(profiles.fullName);

  const existing = Object.fromEntries(
    (await db.select().from(attendance).where(eq(attendance.sessionId, sessionId))).map((a) => [a.studentProfileId, a.status])
  );

  return (
    <div className="space-y-6">
      <Link href="/dashboard/attendance" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All classes
      </Link>
      <div>
        <h1 className="font-serif text-[32px] text-ink-900">{row.s.title}</h1>
        <p className="text-ink-500">{row.batchName} · {formatIST(row.s.startsAt)}</p>
      </div>
      {saved && <p role="status" className="rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-600">Attendance saved.</p>}

      <DashboardCard title={`Students (${roster.length})`}>
        {roster.length === 0 ? (
          <p className="text-sm text-ink-500">No students are enrolled in this batch yet.</p>
        ) : (
          <form action={saveAttendance} className="space-y-4">
            <input type="hidden" name="sessionId" value={sessionId} />
            <ul className="divide-y divide-line">
              {roster.map((st) => {
                const current = existing[st.id] ?? "present";
                return (
                  <li key={st.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="font-medium text-ink-900">{st.name}</span>
                    <fieldset className="flex gap-1 rounded-xl bg-paper-deep p-1">
                      <legend className="sr-only">Attendance for {st.name}</legend>
                      {STATUSES.map((o) => (
                        <label key={o.value} className="cursor-pointer">
                          <input type="radio" name={`s_${st.id}`} value={o.value} defaultChecked={current === o.value} className="peer sr-only" />
                          <span className="flex min-h-9 items-center rounded-lg px-3 text-sm font-semibold text-ink-700 peer-checked:bg-forest-800 peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-ink-700/40">
                            {o.label}
                          </span>
                        </label>
                      ))}
                    </fieldset>
                  </li>
                );
              })}
            </ul>
            <button type="submit" className="min-h-11 rounded-full bg-forest-800 px-6 text-sm font-semibold text-paper hover:bg-forest-900">
              Save attendance
            </button>
          </form>
        )}
      </DashboardCard>
    </div>
  );
}
