import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { StatusBadge } from "@/features/dashboard/ui/StatusBadge";
import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { studentProfiles } from "@/db/schema/core/studentProfiles";
import { enrollments } from "@/db/schema/core/enrollments";
import { batches } from "@/db/schema/core/batches";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, User, Mail, Calendar, GraduationCap, Phone, Clock, FileText } from "lucide-react";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailsPage({ params }: PageProps) {
  await enforcePageRole([ROLES.ADMIN]);
  const resolvedParams = await params;
  const studentId = resolvedParams.id;

  const studentResult = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
      isActive: profiles.isActive,
      createdAt: profiles.createdAt,
      admissionNumber: studentProfiles.admissionNumber,
      enrollmentDate: studentProfiles.enrollmentDate,
      guardianName: studentProfiles.guardianName,
      guardianEmail: studentProfiles.guardianEmail,
      guardianPhone: studentProfiles.guardianPhone,
      notes: studentProfiles.notes,
      batchName: batches.name,
      classLevel: batches.classLevel,
      enrollmentStatus: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
    })
    .from(profiles)
    .leftJoin(studentProfiles, eq(profiles.id, studentProfiles.profileId))
    .leftJoin(enrollments, eq(studentProfiles.profileId, enrollments.studentProfileId))
    .leftJoin(batches, eq(enrollments.batchId, batches.id))
    .where(and(eq(profiles.id, studentId), eq(profiles.role, "student")))
    .limit(1);

  const student = studentResult[0];

  if (!student) {
    return (
      <div className="p-8 text-center text-gray-500 max-w-xl mx-auto mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-xl font-bold font-serif text-gray-900">Student Profile Not Found</h2>
        <p className="text-sm text-gray-500">The student record with the specified ID does not exist in the system database.</p>
        <Link 
          href="/dashboard/students" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students List
        </Link>
      </div>
    );
  }

  const formattedEnrollmentDate = student.enrollmentDate
    ? new Date(student.enrollmentDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const formattedAccountCreatedDate = student.createdAt
    ? new Date(student.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Navigation and Top Bar */}
      <div className="flex flex-col gap-4">
        <div>
          <Link 
            href="/dashboard/students" 
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-2xl shadow-sm border border-brand-primary/10">
              {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">{student.fullName}</h1>
                <StatusBadge status={student.isActive ? "active" : "inactive"} />
              </div>
              <p className="text-sm text-gray-500 font-mono mt-1">Student UID: {student.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Student Information */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Identity & Basic Info */}
          <DashboardCard title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-1">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{student.fullName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">{student.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Admission/Registration Date</p>
                  <p className="text-sm font-medium text-gray-900">{formattedEnrollmentDate || "Not recorded"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Profile Created At</p>
                  <p className="text-sm font-medium text-gray-900">{formattedAccountCreatedDate || "Not recorded"}</p>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Academic Enrollment Profile */}
          <DashboardCard title="Academic Profile & Placement">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-1">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Admission Number</p>
                <p className="text-sm font-mono font-medium text-gray-900 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 w-fit">
                  {student.admissionNumber || "Pending Assignment"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Cohort Batch</p>
                <p className="text-sm font-medium text-gray-900">{student.batchName || "No assigned batch"}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Class Level</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {student.classLevel ? student.classLevel.replace("_", " ") : "Not selected"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Enrollment Status</p>
                <div className="mt-1">
                  <StatusBadge status={student.enrollmentStatus || "inactive"} />
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Internal Notes */}
          {student.notes && (
            <DashboardCard title="Academic Notes">
              <div className="flex gap-3 items-start p-1">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Staff Annotations</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{student.notes}</p>
                </div>
              </div>
            </DashboardCard>
          )}

        </div>

        {/* Guardian / Support Information */}
        <div className="space-y-8">
          
          <DashboardCard title="Guardian Information">
            <div className="space-y-6 p-1">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Primary Guardian Name</p>
                  <p className="text-sm font-medium text-gray-900">{student.guardianName || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Guardian Email</p>
                  <p className="text-sm font-medium text-gray-900">{student.guardianEmail || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Guardian Contact Phone</p>
                  <p className="text-sm font-medium text-gray-900">{student.guardianPhone || "Not provided"}</p>
                </div>
              </div>
            </div>
          </DashboardCard>

        </div>

      </div>
    </div>
  );
}
