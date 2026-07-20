"use client";

import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { DataTable } from "@/features/dashboard/ui/DataTable";
import { StatusBadge } from "@/features/dashboard/ui/StatusBadge";
import { MOCK_BOOKINGS } from "@/features/dashboard/mock/data";

export default function BookingsPage() {
  const columns = [
    { header: "ID", accessorKey: "id" as const, className: "font-mono text-xs text-gray-500" },
    { header: "Student Name", accessorKey: "studentName" as const, className: "font-medium text-gray-900" },
    { header: "Parent Name", accessorKey: "parentName" as const, className: "text-gray-500" },
    { header: "Class", accessorKey: "class" as const, className: "text-gray-500" },
    { header: "Phone", accessorKey: "phone" as const, className: "text-gray-500" },
    { header: "Preferred Slot", accessorKey: "preferredSlot" as const, className: "text-gray-500" },
    { 
      header: "Status", 
      cell: (item: any) => <StatusBadge status={item.status} />
    },
    {
      header: "Actions",
      cell: () => (
        <div className="flex items-center gap-3 text-sm">
          <button className="text-brand-primary hover:text-brand-primary-hover font-medium">View</button>
          <button className="text-emerald-600 hover:text-emerald-700 font-medium">Approve</button>
          <button className="text-red-600 hover:text-red-700 font-medium">Reject</button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Demo Bookings" 
        description="Manage and track upcoming demo classes." 
      />

      <DashboardCard>
        <DataTable data={MOCK_BOOKINGS} columns={columns} />
      </DashboardCard>
    </div>
  );
}
