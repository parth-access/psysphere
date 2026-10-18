import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { StatCard } from "@/features/dashboard/ui/StatCard";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { ActionCard } from "@/features/dashboard/ui/ActionCard";
import { db } from "@/db";
import { count, eq, and, gt, desc } from "drizzle-orm";
import { classSessions } from "@/db/schema/academic/classSessions";
import { assignments } from "@/db/schema/academic/assignments";
import { joinRequests } from "@/db/schema/core/joinRequests";
import { workshops } from "@/db/schema/core/workshops";
import { profiles } from "@/db/schema/core/profiles";
import { batches } from "@/db/schema/core/batches";
import { 
  UserPlus, 
  Users, 
  CalendarPlus, 
  BookOpen, 
  GraduationCap,
  ClipboardList,
  CircleDot
} from "lucide-react";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const profile = await enforcePageRole([ROLES.ADMIN]);

  // 1. Fetch Today's Classes count
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [todayClassesResult] = await db
    .select({ value: count() })
    .from(classSessions)
    .where(
      and(
        gt(classSessions.startsAt, todayStart),
        and(eq(classSessions.status, "scheduled"))
      )
    );
  const todayClassesCount = Number(todayClassesResult?.value) || 0;

  // 2. Fetch Upcoming Assignments count
  const [upcomingAssignmentsResult] = await db
    .select({ value: count() })
    .from(assignments)
    .where(gt(assignments.dueAt, new Date()));
  const upcomingAssignmentsCount = Number(upcomingAssignmentsResult?.value) || 0;

  // 3. Join requests waiting for approval
  const [pendingRequestsResult] = await db
    .select({ value: count() })
    .from(joinRequests)
    .where(eq(joinRequests.status, "pending"));
  const pendingAdmissionsCount = Number(pendingRequestsResult?.value) || 0;

  // 4. Fetch Active Students count
  const [activeStudentsResult] = await db
    .select({ value: count() })
    .from(profiles)
    .where(and(eq(profiles.role, "student"), eq(profiles.isActive, true)));
  const activeStudentsCount = Number(activeStudentsResult?.value) || 0;

  // 5. Fetch Active Batches count
  const [activeBatchesResult] = await db
    .select({ value: count() })
    .from(batches)
    .where(eq(batches.isActive, true));
  const activeBatchesCount = Number(activeBatchesResult?.value) || 0;

  // 6. Recent join requests
  const recentRequests = await db
    .select()
    .from(joinRequests)
    .orderBy(desc(joinRequests.updatedAt))
    .limit(5);

  const STATUS_TEXT: Record<string, string> = {
    pending: "requested a seat",
    approved: "was approved and can pay now",
    paid: "paid",
    enrolled: "joined",
    declined: "was declined",
    cancelled: "cancelled",
  };

  const activities = recentRequests.map((r) => ({
    id: r.id,
    text: `${r.studentName} ${STATUS_TEXT[r.status] ?? r.status}`,
    time: new Date(r.updatedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  // 7. Next workshop
  const [nextWorkshop] = await db
    .select()
    .from(workshops)
    .where(gt(workshops.startsAt, new Date()))
    .orderBy(workshops.startsAt)
    .limit(1);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Overview" 
        description="Welcome back. Here's what's happening today." 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Today's Classes" value={todayClassesCount} />
        <StatCard label="Upcoming Assignments" value={upcomingAssignmentsCount} />
        <StatCard label="Requests to approve" value={pendingAdmissionsCount} />
        <StatCard label="Active Students" value={activeStudentsCount} />
        <StatCard label="Active Batches" value={activeBatchesCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <DashboardCard title="Quick Actions">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <ActionCard icon={<UserPlus />} title="Manage Students" href="/dashboard/students" />
              <ActionCard icon={<Users />} title="Manage Batches" href="/dashboard/batches" />
              <ActionCard icon={<CalendarPlus />} title="Schedule Class" href="/dashboard/classes" />
              <ActionCard icon={<GraduationCap />} title="Manage Teachers" href="/dashboard/teachers" />
              <ActionCard icon={<ClipboardList />} title="Join requests" href="/dashboard/join-requests" />
              <ActionCard icon={<CircleDot />} title="Workshops" href="/dashboard/workshops" />
              <ActionCard icon={<BookOpen />} title="Settings" href="/dashboard/settings" />
            </div>
          </DashboardCard>

          <DashboardCard title="Next free workshop">
            {nextWorkshop ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink-900">{nextWorkshop.title}</p>
                  <p className="text-sm text-ink-500">
                    {nextWorkshop.startsAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <a href={`/dashboard/workshops/${nextWorkshop.id}`} className="inline-flex min-h-10 items-center rounded-xl bg-ink-900 px-4 text-sm font-semibold text-paper hover:bg-ink-700">
                  Manage
                </a>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-ink-500">No workshop scheduled. Workshops are how new students find you.</p>
                <a href="/dashboard/workshops" className="inline-flex min-h-10 items-center rounded-xl bg-ink-900 px-4 text-sm font-semibold text-paper hover:bg-ink-700">
                  Schedule one
                </a>
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <DashboardCard title="Recent Activity" className="h-full">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-ink-500 text-sm">
                No recent activity has been registered yet.
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="mt-1">
                      <CircleDot className="w-4 h-4 text-brand-primary/60" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-900">{activity.text}</p>
                      <p className="text-xs text-ink-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
