"use client";

import { Sidebar } from "@/features/dashboard/ui/Sidebar";
import { DashboardNavbar } from "@/features/dashboard/ui/DashboardNavbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <DashboardNavbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
