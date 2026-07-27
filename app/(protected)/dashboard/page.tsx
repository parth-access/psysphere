import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { StatCard } from "@/features/dashboard/ui/StatCard";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { ActionCard } from "@/features/dashboard/ui/ActionCard";
import { db } from "@/db";
import { count, eq, and, gt, desc } from "drizzle-orm";
import { classSessions } from "@/db/schema/academic/classSessions";
import { assignments } from "@/db/schema/academic/assignments";
import { admissions } from "@/db/schema/core/admissions";
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

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
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

  // 2. Fetch Upcoming Tests/Assignments count
  const [upcomingTestsResult] = await db
    .select({ value: count() })
    .from(assignments)
    .where(gt(assignments.dueAt, new Date()));
  const upcomingTestsCount = Number(upcomingTestsResult?.value) || 0;

  // 3. Fetch Pending Admissions count
  const [pendingDemosResult] = await db
    .select({ value: count() })
    .from(admissions)
    .where(eq(admissions.status, "LEAD"));
  const pendingAdmissionsCount = Number(pendingDemosResult?.value) || 0;

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

  // 6. Fetch Recent Admissions Activity
  const recentAdmissions = await db
    .select()
    .from(admissions)
    .orderBy(desc(admissions.createdAt))
    .limit(5);

  const activities = recentAdmissions.map((adm) => {
    let text = "";
    if (adm.status === "LEAD") {
      text = `Demo requested by ${adm.studentName} (${adm.class})`;
    } else if (adm.status === "DEMO_APPROVED") {
      text = `Demo approved for ${adm.studentName}`;
    } else if (adm.status === "DEMO_SCHEDULED") {
      text = `Demo scheduled for ${adm.studentName}`;
    } else if (adm.status === "ENROLLED") {
      text = `Enrolled student ${adm.studentName} successfully`;
    } else if (adm.status === "REJECTED") {
      text = `Admission request rejected for ${adm.studentName}`;
    } else {
      text = `Admission status of ${adm.studentName} changed to ${adm.status}`;
    }

    return {
      id: adm.id,
      text,
      time: new Date(adm.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Overview" 
        description="Welcome back. Here's what's happening today." 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Today's Classes" value={todayClassesCount} />
        <StatCard label="Upcoming Tests" value={upcomingTestsCount} />
        <StatCard label="Pending Leads" value={pendingAdmissionsCount} />
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
              <ActionCard icon={<ClipboardList />} title="Review Leads" href="/dashboard/admissions" />
              <ActionCard icon={<BookOpen />} title="Settings" href="/dashboard/settings" />
            </div>
          </DashboardCard>

          <DashboardCard title="Schedules Overview">
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-center">
              <p className="text-sm font-medium">To view or update your schedule, navigate to Classes or Batches.</p>
              <p className="text-xs text-gray-400 mt-1">Live class management is fully connected to the PostgreSQL database.</p>
            </div>
          </DashboardCard>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <DashboardCard title="Recent Activity" className="h-full">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
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
                      <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
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
