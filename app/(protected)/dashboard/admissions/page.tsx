export const dynamic = "force-dynamic";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { DataTable } from "@/features/dashboard/ui/DataTable";
import { StatusBadge } from "@/features/dashboard/ui/StatusBadge";
import { admissionRepository } from "@/src/domains/admissions/repository";
import Link from "next/link";
import { approveAdmissionAction, rejectAdmissionAction, convertAdmissionAction } from "./actions";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";

export default async function AdmissionsPage() {
  await enforcePageRole([ROLES.ADMIN]);
  const admissionsData = await admissionRepository.findAll();

  const columns = [
    { header: "Admission ID", accessorKey: "id" as const, className: "font-mono text-xs text-gray-500" },
    { header: "Student Name", accessorKey: "studentName" as const, className: "font-medium text-gray-900" },
    { header: "Parent Name", accessorKey: "parentName" as const, className: "text-gray-500 hidden md:table-cell" },
    { header: "Email", accessorKey: "email" as const, className: "text-gray-500 hidden lg:table-cell" },
    { header: "Phone", accessorKey: "phone" as const, className: "text-gray-500 hidden sm:table-cell" },
    { header: "Class", accessorKey: "class" as const, className: "text-gray-500" },
    { header: "Program", accessorKey: "program" as const, className: "text-gray-500 hidden lg:table-cell" },
    { header: "Demo Date", accessorKey: "demoDate" as const, className: "text-gray-500 hidden xl:table-cell" },
    { header: "Assigned Teacher", accessorKey: "assignedTeacher" as const, className: "text-gray-500 hidden xl:table-cell" },
    { 
      header: "Status", 
      cell: (item: any) => <StatusBadge status={item.status} />
    },
    {
      header: "Actions",
      cell: (item: any) => (
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/dashboard/admissions/${item.id}`} className="text-brand-primary hover:text-brand-primary-hover font-medium">View</Link>
          <form action={approveAdmissionAction.bind(null, item.id)} className="inline">
            <button type="submit" className="text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer">Approve</button>
          </form>
          <form action={rejectAdmissionAction.bind(null, item.id)} className="inline">
            <button type="submit" className="text-red-600 hover:text-red-700 font-medium cursor-pointer">Reject</button>
          </form>
          <form action={convertAdmissionAction.bind(null, item.id)} className="inline">
            <button type="submit" className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">Convert</button>
          </form>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Admissions" 
        description="Manage the complete student lifecycle from lead to enrollment." 
      />

      <DashboardCard>
        <DataTable data={admissionsData} columns={columns} />
      </DashboardCard>
    </div>
  );
}
