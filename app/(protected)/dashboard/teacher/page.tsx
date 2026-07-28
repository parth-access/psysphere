import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { StatCard } from "@/features/dashboard/ui/StatCard";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { requireRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { classSessions } from "@/db/schema/academic/classSessions";
import { assignments } from "@/db/schema/academic/assignments";
import { batches } from "@/db/schema/core/batches";
import { 
  Calendar, 
  Clock, 
  ExternalLink 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const profile = await requireRole([ROLES.TEACHER, ROLES.ADMIN]);
  
  // 1. Get Scheduled Classes
  const scheduledClasses = await db
    .select()
    .from(classSessions)
    .where(eq(classSessions.status, "scheduled"))
    .orderBy(classSessions.startsAt)
    .limit(5);

  // 2. Get All Active Batches
  const activeBatches = await db
    .select()
    .from(batches)
    .where(eq(batches.isActive, true))
    .orderBy(batches.name);

  // 3. Get Recent Assignments
  const recentAssignments = await db
    .select()
    .from(assignments)
    .orderBy(desc(assignments.dueAt))
    .limit(5);

  return (
    <div className="space-y-8">
      <PageHeader 
        title={`Welcome, ${profile.fullName || "Educator"}`} 
        description="Here is your educator dashboard and schedule overview." 
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Active Cohorts" 
          value={activeBatches.length} 
        />
        <StatCard 
          label="Scheduled Lectures" 
          value={scheduledClasses.length} 
        />
        <StatCard 
          label="Total Assignments" 
          value={recentAssignments.length} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Classes Section */}
        <DashboardCard title="Active Timeline / Scheduled Classes">
          {scheduledClasses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No upcoming classes scheduled. Navigate to Classes to add one.
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledClasses.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-primary/20 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{cls.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(cls.startsAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <a href={cls.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-semibold hover:bg-brand-primary/20 transition-colors">
                    Join Call
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        {/* Assignments Section */}
        <DashboardCard title="Assignments Issued">
          {recentAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No assignments issued yet. Go to Classes or Batches to assign coursework.
            </div>
          ) : (
            <div className="space-y-4">
              {recentAssignments.map((asm) => (
                <div key={asm.id} className="p-4 bg-[#FAF8F5] border border-gray-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{asm.title}</p>
                    <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-medium">
                      {asm.maxMarks} Marks
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{asm.instructions}</p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    Due: {new Date(asm.dueAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
