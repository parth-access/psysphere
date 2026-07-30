import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { StatCard } from "@/features/dashboard/ui/StatCard";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { db } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { studentProfiles } from "@/db/schema/core/studentProfiles";
import { enrollments } from "@/db/schema/core/enrollments";
import { batches } from "@/db/schema/core/batches";
import { profiles } from "@/db/schema/core/profiles";
import { classSessions } from "@/db/schema/academic/classSessions";
import { assignments } from "@/db/schema/academic/assignments";
import { 
  Calendar, 
  Clock, 
  ExternalLink,
  GraduationCap
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const profile = await enforcePageRole([ROLES.STUDENT, ROLES.ADMIN]);
  
  // 1. Find Student Profile
  const [studentProfile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.profileId, profile.id));

  let batchInfo: any = null;
  let upcomingClasses: any[] = [];
  let studentAssignments: any[] = [];

  if (studentProfile) {
    // 2. Find Active Enrollment
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.studentProfileId, profile.id), eq(enrollments.status, "active")));

    if (enrollment) {
      // 3. Find Batch & Join with Teacher Profile
      const [batch] = await db
        .select({
          id: batches.id,
          name: batches.name,
          classLevel: batches.classLevel,
          academicYear: batches.academicYear,
          schedule: batches.schedule,
          isActive: batches.isActive,
          teacherName: profiles.fullName,
        })
        .from(batches)
        .leftJoin(profiles, eq(batches.teacherId, profiles.id))
        .where(eq(batches.id, enrollment.batchId));
      batchInfo = batch;

      if (batch) {
        // 4. Find Scheduled Classes for this Batch
        upcomingClasses = await db
          .select()
          .from(classSessions)
          .where(and(eq(classSessions.batchId, batch.id), eq(classSessions.status, "scheduled")))
          .orderBy(classSessions.startsAt)
          .limit(5);

        // 5. Find Assignments for this Batch
        studentAssignments = await db
          .select()
          .from(assignments)
          .where(eq(assignments.batchId, batch.id))
          .orderBy(desc(assignments.dueAt))
          .limit(5);
      }
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader 
        title={`Welcome, ${profile.fullName || "Student"}`} 
        description="Here is your learning dashboard, cohort details, and academic progress." 
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Enrollment Status" 
          value={studentProfile ? "Registered" : "Pending"} 
        />
        <StatCard 
          label="Your Cohort Batch" 
          value={batchInfo ? batchInfo.name : "Unassigned"} 
        />
        <StatCard 
          label="Upcoming Lectures" 
          value={upcomingClasses.length} 
        />
      </div>

      {/* Details Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Classes & Homework */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Class Schedule Section */}
          <DashboardCard title="Your Lectures Schedule">
            {upcomingClasses.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No upcoming live classes scheduled for your batch cohort at this time.
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingClasses.map((cls) => (
                  <div key={cls.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-brand-primary/20 transition-all shadow-3xs gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-brand-surface text-brand-primary border border-brand-primary/10 rounded-md">
                          Lecture
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
                    
                    <a 
                      href={cls.meetingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary text-white hover:bg-brand-primary-hover rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Join Live Lecture
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          {/* Assignments Section */}
          <DashboardCard title="Assignments & Coursework">
            {studentAssignments.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No homework or coursework assignments published for your cohort.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {studentAssignments.map((asm) => (
                  <div key={asm.id} className="p-4 bg-[#FAF8F5] border border-gray-100 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full font-semibold">
                        Due soon
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

        {/* Cohort Cohort Information */}
        <div className="space-y-6">
          <DashboardCard title="Your Academic Cohort">
            {!batchInfo ? (
              <p className="text-xs text-gray-500 leading-relaxed p-1">
                You are not currently enrolled in any academic cohorts. Please contact the PsySphere admissions team to assign your batch.
              </p>
            ) : (
              <div className="space-y-4 p-1">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Batch Name</p>
                  <p className="text-sm font-semibold text-gray-900">{batchInfo.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Class Level</p>
                  <span className="inline-block px-2.5 py-0.5 bg-brand-surface border border-brand-primary/10 text-brand-primary text-xs font-semibold rounded-full uppercase">
                    {batchInfo.classLevel.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Assigned Instructor</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mt-0.5">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span>{batchInfo.teacherName || "Pending Assignment"}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Academic Year</p>
                  <p className="text-sm font-medium text-gray-900">{batchInfo.academicYear}</p>
                </div>
                {batchInfo.schedule && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Cohort Weekly Schedule</p>
                    <p className="text-sm font-medium text-gray-900">{batchInfo.schedule}</p>
                  </div>
                )}
              </div>
            )}
          </DashboardCard>
        </div>

      </div>
    </div>
  );
}
