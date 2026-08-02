export const dynamic = "force-dynamic";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { DataTable } from "@/features/dashboard/ui/DataTable";
import { StatusBadge } from "@/features/dashboard/ui/StatusBadge";
import { studentRepository } from "@/src/domains/users/repository";
import Link from "next/link";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";

export default async function StudentsPage() {
  await enforcePageRole([ROLES.ADMIN]);
  const studentsData = await studentRepository.findAllStudents();

  const columns = [
    { header: "Student Name", accessorKey: "fullName" as const, className: "font-medium text-gray-900" },
    { header: "Email", accessorKey: "email" as const, className: "text-gray-500" },
    { header: "Admission No.", accessorKey: "admissionNumber" as const, className: "text-gray-500 font-mono text-xs" },
    { header: "Enrollment Date", accessorKey: "enrollmentDate" as const, className: "text-gray-500 hidden sm:table-cell" },
    {
      header: "Actions",
      cell: (item: any) => (
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/dashboard/students/${item.id}`} className="text-brand-primary hover:text-brand-primary-hover font-medium">View Profile</Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Students" 
        description="Manage enrolled students and their academic profiles." 
      />

      <DashboardCard>
        <DataTable data={studentsData} columns={columns} />
      </DashboardCard>
    </div>
  );
}
