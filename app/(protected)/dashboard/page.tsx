import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { StatCard } from "@/features/dashboard/ui/StatCard";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { ActionCard } from "@/features/dashboard/ui/ActionCard";
import { MOCK_STATS, MOCK_RECENT_ACTIVITY } from "@/features/dashboard/mock/data";
import { 
  UserPlus, 
  Users, 
  CalendarPlus, 
  Upload, 
  FileText, 
  Megaphone,
  CircleDot
} from "lucide-react";

export default function DashboardHomePage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Overview" 
        description="Welcome back. Here's what's happening today." 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Today's Classes" value={MOCK_STATS.todayClasses} />
        <StatCard label="Upcoming Tests" value={MOCK_STATS.upcomingTests} />
        <StatCard label="Pending Demos" value={MOCK_STATS.pendingDemos} />
        <StatCard label="Active Students" value={MOCK_STATS.activeStudents} />
        <StatCard label="Fee Collection" value={MOCK_STATS.feeCollection} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <DashboardCard title="Quick Actions">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <ActionCard icon={<UserPlus />} title="Add Student" />
              <ActionCard icon={<Users />} title="Create Batch" />
              <ActionCard icon={<CalendarPlus />} title="Schedule Class" />
              <ActionCard icon={<Upload />} title="Upload Notes" />
              <ActionCard icon={<FileText />} title="Create Test" />
              <ActionCard icon={<Megaphone />} title="Send Announcement" />
            </div>
          </DashboardCard>

          <DashboardCard title="Upcoming Schedule">
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <p>Calendar integration placeholder</p>
            </div>
          </DashboardCard>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <DashboardCard title="Recent Activity" className="h-full">
            <div className="space-y-6">
              {MOCK_RECENT_ACTIVITY.map((activity) => (
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
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
