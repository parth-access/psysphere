export const dynamic = "force-dynamic";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { DataTable } from "@/features/dashboard/ui/DataTable";
import { teacherRepository } from "@/src/domains/users/repository";
import Link from "next/link";

export default async function TeachersPage() {
  const teachersData = await teacherRepository.findAllTeachers();

  const columns = [
    { header: "Teacher Name", accessorKey: "fullName" as const, className: "font-medium text-gray-900" },
    { header: "Email", accessorKey: "email" as const, className: "text-gray-500" },
    {
      header: "Actions",
      cell: (item: any) => (
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/dashboard/teachers/${item.id}`} className="text-brand-primary hover:text-brand-primary-hover font-medium">View Profile</Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Teachers" 
        description="Manage teaching staff and their class schedules." 
      />

      <DashboardCard>
        <DataTable data={teachersData} columns={columns} />
      </DashboardCard>
    </div>
  );
}
