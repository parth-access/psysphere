import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { StatusBadge } from "@/features/dashboard/ui/StatusBadge";
import { db } from "@/db";
import { batches } from "@/db/schema/core/batches";
import { enrollments } from "@/db/schema/core/enrollments";
import { studentProfiles } from "@/db/schema/core/studentProfiles";
import { profiles } from "@/db/schema/core/profiles";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, User, Mail, Calendar, GraduationCap, Users, Plus, Trash2, CalendarClock } from "lucide-react";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { enrollStudentAction, updateBatchTeacherAction, removeStudentFromBatchAction } from "./actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BatchDetailsPage({ params }: PageProps) {
  await enforcePageRole([ROLES.ADMIN]);
  const resolvedParams = await params;
  const batchId = resolvedParams.id;

  // 1. Fetch cohort batch details joined with assigned teacher
  const batchResult = await db
    .select({
      id: batches.id,
      name: batches.name,
      classLevel: batches.classLevel,
      academicYear: batches.academicYear,
      schedule: batches.schedule,
      isActive: batches.isActive,
      teacherId: batches.teacherId,
      teacherName: profiles.fullName,
    })
    .from(batches)
    .leftJoin(profiles, eq(batches.teacherId, profiles.id))
    .where(eq(batches.id, batchId))
    .limit(1);

  const batch = batchResult[0];

  if (!batch) {
    return (
      <div className="p-8 text-center text-gray-500 max-w-xl mx-auto mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-xl font-bold font-serif text-gray-900">Cohort Batch Not Found</h2>
        <p className="text-sm text-gray-500">The coaching batch with the specified ID does not exist in the platform database.</p>
        <Link 
          href="/dashboard/batches" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Batches
        </Link>
      </div>
    );
  }

  // 2. Fetch enrolled students in this batch
  const enrolledStudents = await db
    .select({
      enrollmentId: enrollments.id,
      profileId: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
      enrolledAt: enrollments.enrolledAt,
      admissionNumber: studentProfiles.admissionNumber,
    })
    .from(enrollments)
    .innerJoin(studentProfiles, eq(enrollments.studentProfileId, studentProfiles.profileId))
    .innerJoin(profiles, eq(studentProfiles.profileId, profiles.id))
    .where(eq(enrollments.batchId, batchId));

  // 3. Fetch all active teachers for the update dropdown
  const activeTeachers = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
    })
    .from(profiles)
    .where(and(eq(profiles.role, "teacher"), eq(profiles.isActive, true)));

  // 4. Fetch all active students who are NOT currently enrolled in this batch
  const allActiveStudents = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
    })
    .from(profiles)
    .innerJoin(studentProfiles, eq(profiles.id, studentProfiles.profileId))
    .where(and(eq(profiles.role, "student"), eq(profiles.isActive, true)));

  const enrolledStudentIdSet = new Set(enrolledStudents.map((s) => s.profileId));
  const availableStudents = allActiveStudents.filter((s) => !enrolledStudentIdSet.has(s.id));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Navigation Top Header */}
      <div className="flex flex-col gap-2">
        <Link 
          href="/dashboard/batches" 
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Batches list
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">{batch.name}</h1>
              <StatusBadge status={batch.isActive ? "active" : "inactive"} />
            </div>
            <p className="text-sm text-gray-500 font-mono mt-1">Batch ID: {batch.id}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Enrollment List & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Cohort Details */}
          <DashboardCard title="Cohort Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-1">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Class Level</p>
                <span className="inline-block px-2.5 py-0.5 bg-brand-surface border border-brand-primary/10 text-brand-primary text-xs font-semibold rounded-full uppercase">
                  {batch.classLevel.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Weekly Schedule</p>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <CalendarClock className="w-4 h-4 text-gray-400" />
                  <span>{batch.schedule || "No schedule set yet"}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Academic Cohort Year</p>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{batch.academicYear}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Assigned Instructor</p>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span>{batch.teacherName || "No instructor assigned"}</span>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Enrolled Students list */}
          <DashboardCard title={`Enrolled Students (${enrolledStudents.length})`}>
            {enrolledStudents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium">No students enrolled in this batch yet.</p>
                <p className="text-xs text-gray-400 mt-1">Enroll an existing active student using the panel on the right.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                      <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Admission No.</th>
                      <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                      <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enrolledStudents.map((student) => {
                      const formattedDate = new Date(student.enrolledAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });

                      return (
                        <tr key={student.profileId} className="hover:bg-gray-50/30 transition-colors">
                          <td className="py-4 px-6">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{student.fullName}</p>
                              <p className="text-xs text-gray-400">{student.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm font-mono text-gray-600">
                            {student.admissionNumber || "Pending"}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {formattedDate}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <form action={removeStudentFromBatchAction} className="inline-block">
                              <input type="hidden" name="enrollmentId" value={student.enrollmentId} />
                              <input type="hidden" name="batchId" value={batchId} />
                              <button 
                                type="submit" 
                                className="text-xs inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/50 rounded-lg font-semibold transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Unenroll
                              </button>
                            </form>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>

        </div>

        {/* Sidebar Cohort Administration Tools */}
        <div className="space-y-8">
          
          {/* Enroll Student Tool */}
          <DashboardCard title="Enroll a Student">
            {availableStudents.length === 0 ? (
              <p className="text-xs text-gray-500 leading-relaxed p-1">
                All active PsySphere students are already enrolled in this cohort batch. No other available students were found.
              </p>
            ) : (
              <form action={enrollStudentAction} className="space-y-4">
                <input type="hidden" name="batchId" value={batchId} />
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">Select Student</label>
                  <select 
                    name="studentProfileId" 
                    required 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  >
                    <option value="">Choose an active student...</option>
                    {availableStudents.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.fullName} ({st.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-2 rounded-xl text-sm font-semibold hover:bg-brand-primary-hover transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Enroll into Cohort
                </button>
              </form>
            )}
          </DashboardCard>

          {/* Change Teacher Assignment Tool */}
          <DashboardCard title="Reassign Teacher">
            <form action={updateBatchTeacherAction} className="space-y-4">
              <input type="hidden" name="batchId" value={batchId} />
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">Choose Instructor</label>
                <select 
                  name="teacherId" 
                  required 
                  defaultValue={batch.teacherId || ""}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                >
                  <option value="">Select an active instructor...</option>
                  {activeTeachers.map((tc) => (
                    <option key={tc.id} value={tc.id}>{tc.fullName}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 hover:text-gray-900 py-2 border border-gray-200 hover:border-gray-300 rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-3xs"
              >
                <GraduationCap className="w-4 h-4 text-gray-400" />
                Update Assigned Instructor
              </button>
            </form>
          </DashboardCard>

        </div>

      </div>
    </div>
  );
}
