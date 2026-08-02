import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { db } from "@/db";
import { batches } from "@/db/schema/core/batches";
import { enrollments } from "@/db/schema/core/enrollments";
import { profiles } from "@/db/schema/core/profiles";
import { eq, and, count } from "drizzle-orm";
import { Users, CalendarClock, BookOpen, Layers, Plus, Calendar, GraduationCap, ArrowRight } from "lucide-react";
import { createBatchAction } from "./actions";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BatchesPage() {
  await enforcePageRole([ROLES.ADMIN]);

  // Fetch active teachers for the assignment dropdown
  const activeTeachers = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
    })
    .from(profiles)
    .where(and(eq(profiles.role, "teacher"), eq(profiles.isActive, true)));

  // Query batches along with real enrollment aggregates from database and assigned teacher info
  const batchesList = await db
    .select({
      id: batches.id,
      name: batches.name,
      classLevel: batches.classLevel,
      academicYear: batches.academicYear,
      schedule: batches.schedule,
      isActive: batches.isActive,
      teacherName: profiles.fullName,
      studentsCount: count(enrollments.id)
    })
    .from(batches)
    .leftJoin(profiles, eq(batches.teacherId, profiles.id))
    .leftJoin(
      enrollments,
      and(
        eq(batches.id, enrollments.batchId),
        eq(enrollments.status, "active")
      )
    )
    .groupBy(batches.id, profiles.fullName);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Batches" 
        description="Configure academic coaching cohorts, class schedules, and student distribution."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Batches List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-serif font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-primary" />
            Active Batches ({batchesList.length})
          </h2>

          {batchesList.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl text-gray-500">
              <p className="text-sm font-medium">No active batches created yet.</p>
              <p className="text-xs text-gray-400 mt-1">Use the batch creation panel to launch your first coaching cohort.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {batchesList.map((batch) => (
                <DashboardCard key={batch.id} className="hover:border-brand-primary/20 transition-all shadow-3xs hover:shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-gray-900">{batch.name}</h3>
                        <span className="inline-block px-2.5 py-0.5 bg-brand-surface border border-brand-primary/10 text-brand-primary text-xs font-semibold rounded-full mt-2 uppercase">
                          {batch.classLevel.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span className="truncate">Teacher: <strong className="font-medium text-gray-900">{batch.teacherName || "Unassigned"}</strong></span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{batch.studentsCount} Registered Students</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <CalendarClock className="w-4 h-4 text-gray-400" />
                        <span className="truncate">Schedule: {batch.schedule || "Not set yet"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Academic Year: {batch.academicYear}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                      {batch.isActive ? "Active" : "Inactive"}
                    </span>
                    <Link 
                      href={`/dashboard/batches/${batch.id}`} 
                      className="text-xs inline-flex items-center gap-1 font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
                    >
                      Manage Cohort
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>

        {/* Creation Sidepanel */}
        <div className="space-y-6">
          <DashboardCard title="Launch New Batch">
            {activeTeachers.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500">
                <p className="font-medium text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                  Please invite and activate at least one teacher first before launching any new batch cohorts.
                </p>
              </div>
            ) : (
              <form action={createBatchAction} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Batch Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    placeholder="e.g. Class 12 Advanced Batch A" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Class Level</label>
                  <select 
                    name="classLevel" 
                    required 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  >
                    <option value="class_11">Class 11</option>
                    <option value="class_12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Assigned Teacher</label>
                  <select 
                    name="teacherId" 
                    required 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  >
                    <option value="">Select an active teacher...</option>
                    {activeTeachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Academic Year</label>
                  <input 
                    type="text" 
                    name="academicYear" 
                    required 
                    defaultValue={`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Weekly Schedule</label>
                  <input 
                    type="text" 
                    name="schedule" 
                    placeholder="e.g. Mon, Wed, Fri at 5:00 PM" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-primary-hover transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Create Cohort
                  </button>
                </div>
              </form>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
