"use client";

import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { DataTable } from "@/features/dashboard/ui/DataTable";
import { StatusBadge } from "@/features/dashboard/ui/StatusBadge";
import { SearchInput } from "@/features/dashboard/ui/SearchInput";
import { MOCK_STUDENTS } from "@/features/dashboard/mock/data";
import { Plus } from "lucide-react";

export default function StudentsPage() {
  const columns = [
    { header: "Admission No", accessorKey: "admissionNo" as const, className: "font-mono text-xs text-gray-500" },
    { header: "Name", accessorKey: "name" as const, className: "font-medium text-gray-900" },
    { header: "Batch", accessorKey: "batch" as const, className: "text-gray-500" },
    { header: "Attendance", accessorKey: "attendance" as const, className: "text-gray-900 font-medium" },
    { 
      header: "Status", 
      cell: (item: any) => <StatusBadge status={item.status} />
    },
    {
      header: "Actions",
      cell: () => (
        <div className="flex items-center gap-3 text-sm">
          <button className="text-brand-primary hover:text-brand-primary-hover font-medium">View Profile</button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Students" 
        description="Manage enrolled students across all batches."
        action={
          <button className="bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-primary-hover transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        }
      />

      <DashboardCard>
        <div className="mb-6 flex items-center gap-4">
          <SearchInput placeholder="Search students by name or admission no..." className="max-w-md" />
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Filter</button>
          </div>
        </div>
        
        <DataTable data={MOCK_STUDENTS} columns={columns} />
        
        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <span>Showing 1 to {MOCK_STUDENTS.length} of 142 results</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
