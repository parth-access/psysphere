import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Video, ExternalLink } from "lucide-react";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { getWorkshopWithRegistrations, formatWorkshopTime } from "@/src/domains/workshops/service";
import { toggleAttendanceAction, togglePublishedAction, sendRemindersAction, sendJoinInvitesAction } from "../actions";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const btn = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold";

export default async function WorkshopAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  await enforcePageRole([ROLES.ADMIN]);
  const { id } = await params;
  const { notice } = await searchParams;
  if (!UUID.test(id)) notFound();
  const data = await getWorkshopWithRegistrations(id);
  if (!data) notFound();
  const { workshop: w, registrations } = data;
  const started = w.startsAt < new Date();
  const attendedCount = registrations.filter((r) => r.attended).length;
  const fmt = (d: Date | null) => (d ? d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) : null);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <Link href="/dashboard/workshops" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All workshops
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif text-ink-900">{w.title}</h1>
            <p className="text-sm text-ink-500">{formatWorkshopTime(w.startsAt, w.endsAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {w.meetingUrl && (
              <a href={w.meetingUrl} target="_blank" rel="noreferrer" className={`${btn} bg-forest-800 text-paper hover:bg-forest-900`}>
                <Video className="h-4 w-4" aria-hidden="true" /> Open Meet
              </a>
            )}
            <a href={`/workshops/${w.id}`} target="_blank" rel="noreferrer" className={`${btn} border border-line bg-white text-ink-900 hover:bg-paper`}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Public page
            </a>
            <form action={togglePublishedAction}>
              <input type="hidden" name="id" value={w.id} />
              <input type="hidden" name="publish" value={w.isPublished ? "0" : "1"} />
              <button type="submit" className={`${btn} border border-line bg-white text-ink-900 hover:bg-paper`}>
                {w.isPublished ? "Hide from website" : "Show on website"}
              </button>
            </form>
          </div>
        </div>
        {notice && <p role="status" className="rounded-xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-600">{notice}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DashboardCard title={`Registered (${registrations.length})${started ? ` · attended ${attendedCount}` : ""}`}>
            {registrations.length === 0 ? (
              <p className="text-sm text-ink-500">No one has registered yet. Share the public page link.</p>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-ink-500">
                      <th className="px-6 py-2 font-semibold">Student</th>
                      <th className="px-3 py-2 font-semibold">Parent</th>
                      <th className="px-3 py-2 font-semibold">Class</th>
                      <th className="px-6 py-2 font-semibold text-right">Attended</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {registrations.map((r) => (
                      <tr key={r.id}>
                        <td className="px-6 py-3">
                          <p className="font-semibold text-ink-900">{r.studentName}</p>
                          <p className="text-ink-500">{r.email} · {r.phone}</p>
                        </td>
                        <td className="px-3 py-3 text-ink-500">{r.parentName}<br />{r.parentPhone}</td>
                        <td className="px-3 py-3 text-ink-500">{r.classLevel === "class_11" ? "11" : "12"}</td>
                        <td className="px-6 py-3 text-right">
                          <form action={toggleAttendanceAction}>
                            <input type="hidden" name="workshopId" value={w.id} />
                            <input type="hidden" name="registrationId" value={r.id} />
                            <input type="hidden" name="attended" value={r.attended ? "0" : "1"} />
                            <button
                              type="submit"
                              aria-pressed={r.attended}
                              aria-label={`${r.studentName} attended`}
                              className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${r.attended ? "bg-sage-600 text-white" : "border border-line text-ink-500 hover:bg-paper"}`}
                            >
                              {r.attended ? "Yes" : "No"}
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>
        </div>

        <div className="space-y-6">
          <DashboardCard title="Before the workshop">
            <form action={sendRemindersAction} className="space-y-3">
              <input type="hidden" name="id" value={w.id} />
              <p className="text-sm text-ink-500">Email everyone the time and Meet link again.</p>
              <button type="submit" disabled={registrations.length === 0} className={`${btn} w-full bg-forest-800 text-paper hover:bg-forest-900 disabled:opacity-50`}>
                Send reminder
              </button>
              {w.remindersSentAt && <p className="text-xs text-ink-500">Last sent {fmt(w.remindersSentAt)}</p>}
            </form>
          </DashboardCard>

          <DashboardCard title="After the workshop">
            <form action={sendJoinInvitesAction} className="space-y-3">
              <input type="hidden" name="id" value={w.id} />
              <p className="text-sm text-ink-500">Invite students to join a batch. The email links to the Join page with their class already chosen.</p>
              <label className="flex items-center gap-2 text-sm text-ink-900">
                <input type="checkbox" name="onlyAttended" defaultChecked={attendedCount > 0} className="h-4 w-4 accent-ink-900" />
                Only students marked as attended
              </label>
              <button type="submit" disabled={registrations.length === 0} className={`${btn} w-full bg-marigold-500 text-ink-900 hover:bg-marigold-100 disabled:opacity-50`}>
                Send join invitations
              </button>
              {w.joinInvitesSentAt && <p className="text-xs text-ink-500">Last sent {fmt(w.joinInvitesSentAt)}</p>}
            </form>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
