import { Sidebar } from "@/features/dashboard/ui/Sidebar";
import { DashboardNavbar } from "@/features/dashboard/ui/DashboardNavbar";
import { getCurrentProfile } from "@/src/domains/auth/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans">
      <Sidebar userProfile={profile} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <DashboardNavbar userProfile={profile} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
