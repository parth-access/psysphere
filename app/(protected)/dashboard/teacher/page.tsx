import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { StatCard } from "@/features/dashboard/ui/StatCard";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { db } from "@/db";
import { eq, desc, and, inArray } from "drizzle-orm";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { classSessions } from "@/db/schema/academic/classSessions";
import { assignments } from "@/db/schema/academic/assignments";
import { batches } from "@/db/schema/core/batches";
import { 
  Calendar, 
  Clock, 
  ExternalLink,
  Layers,
  GraduationCap
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const profile = await enforcePageRole([ROLES.TEACHER, ROLES.ADMIN]);
  
  // 1. Get Scheduled Classes only for batches assigned to this teacher
  const scheduledClasses = await db
    .select({
      id: classSessions.id,
      title: classSessions.title,
      topicTitle: classSessions.topicTitle,
      meetingUrl: classSessions.meetingUrl,
      startsAt: classSessions.startsAt,
      status: classSessions.status,
      batchName: batches.name,
    })
    .from(classSessions)
    .innerJoin(batches, eq(classSessions.batchId, batches.id))
    .where(
      and(
        eq(classSessions.status, "scheduled"),
        eq(batches.teacherId, profile.id)
      )
    )
    .orderBy(classSessions.startsAt)
    .limit(5);

  // 2. Get active batches assigned to this teacher
  const activeBatches = await db
    .select()
    .from(batches)
    .where(
      and(
        eq(batches.isActive, true),
        eq(batches.teacherId, profile.id)
      )
    )
    .orderBy(batches.name);

  // 3. Get Recent Assignments belonging to this teacher's batches
  const activeBatchIds = activeBatches.map(b => b.id);
  
  let recentAssignments: any[] = [];
  if (activeBatchIds.length > 0) {
    recentAssignments = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        instructions: assignments.instructions,
        dueAt: assignments.dueAt,
        maxMarks: assignments.maxMarks,
        batchName: batches.name,
      })
      .from(assignments)
      .innerJoin(batches, eq(assignments.batchId, batches.id))
      .where(inArray(assignments.batchId, activeBatchIds))
      .orderBy(desc(assignments.dueAt))
      .limit(5);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader 
        title={`Welcome, ${profile.fullName || "Educator"}`} 
        description="Here is your educator dashboard, assigned coaching cohorts, and scheduled lecture timeline." 
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Assigned Cohorts" 
          value={activeBatches.length} 
        />
        <StatCard 
          label="Your Scheduled Lectures" 
          value={scheduledClasses.length} 
        />
        <StatCard 
          label="Active Homework Assignments" 
          value={recentAssignments.length} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Classes Section */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Upcoming Lectures Timeline">
            {scheduledClasses.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No upcoming classes scheduled. Navigate to the Classes page to schedule one.
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledClasses.map((cls) => (
                  <div key={cls.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-brand-primary/20 transition-all shadow-3xs gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-brand-surface text-brand-primary border border-brand-primary/10 rounded-md">
                          {cls.batchName}
                        </span>
                        <h4 className="text-sm font-semibold text-gray-900">{cls.title}</h4>
                      </div>
                      <p className="text-xs text-gray-600">Topic: {cls.topicTitle}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(cls.startsAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <a href={cls.meetingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary text-white hover:bg-brand-primary-hover rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap">
                      Join Lecture
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          {/* Assigned Batches List */}
          <DashboardCard title="Your Assigned Batches">
            {activeBatches.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                You are not currently assigned to any active batches. Please contact the administrator to be assigned to a cohort.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeBatches.map((batch) => (
                  <div key={batch.id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                    <h4 className="font-serif font-bold text-gray-900">{batch.name}</h4>
                    <div className="mt-2 space-y-1.5 text-xs text-gray-600">
                      <p>Level: <strong className="font-medium uppercase">{batch.classLevel.replace(/_/g, ' ')}</strong></p>
                      <p>Schedule: <strong className="font-medium">{batch.schedule || "Not set"}</strong></p>
                      <p>Academic Year: <strong className="font-medium">{batch.academicYear}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Assignments Section */}
        <div className="space-y-6">
          <DashboardCard title="Issued Coursework">
            {recentAssignments.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm p-2">
                No homework assignments issued yet for your assigned cohorts.
              </div>
            ) : (
              <div className="space-y-4">
                {recentAssignments.map((asm) => (
                  <div key={asm.id} className="p-4 bg-[#FAF8F5] border border-gray-100 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] bg-brand-surface text-brand-primary border border-brand-primary/10 px-2 py-0.5 rounded-full font-medium uppercase">
                        {asm.batchName}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
                        {asm.maxMarks} Marks
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{asm.title}</p>
                    <p className="text-[11px] text-gray-600 line-clamp-2">{asm.instructions}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
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
    </div>
  );
}
