import { SubmitButton } from "@/features/shared/ui/SubmitButton";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { DataTable } from "@/features/dashboard/ui/DataTable";
import { EmptyState } from "@/features/dashboard/ui/EmptyState";
import { Inbox } from "lucide-react";
import { teacherRepository } from "@/src/domains/users/repository";
import { Plus, UserCheck } from "lucide-react";
import { createTeacherAction } from "./actions";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  await enforcePageRole([ROLES.ADMIN]);
  const teachersData = await teacherRepository.findAllTeachers();

  const columns = [
    { header: "Teacher Name", accessorKey: "fullName" as const, className: "font-medium text-ink-900" },
    { header: "Email", accessorKey: "email" as const, className: "text-ink-500" },
    {
      header: "Status",
      cell: (item: any) => (
        <span className="text-xs font-semibold bg-sage-100 text-sage-600 border border-sage-100 px-2 py-0.5 rounded-full">
          {item.isActive ? "Active" : "Inactive"}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Teachers" 
        description="Manage teaching faculty, credentials, and classroom assignments." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-serif font-semibold text-ink-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brand-primary" />
            Active Faculty ({teachersData.length})
          </h2>

          <DashboardCard>
            <DataTable emptyState={<EmptyState icon={<Inbox />} title="No teachers found" description="Invite a teacher using the form to start assigning classes." />} data={teachersData} columns={columns} />
          </DashboardCard>
        </div>

        {/* Creation Column */}
        <div className="space-y-6">
          <DashboardCard title="Invite New Teacher">
            <form action={createTeacherAction} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink-700 uppercase tracking-wider block mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  required 
                  placeholder="e.g. Dravina Gupta" 
                  className="w-full px-4 py-2 border border-line rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-700 uppercase tracking-wider block mb-1">Registered Email</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="e.g. dravina@psysphere.com" 
                  className="w-full px-4 py-2 border border-line rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              <div className="pt-2">
                <SubmitButton 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-primary-hover transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Invite Faculty
                </SubmitButton>
              </div>
            </form>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
