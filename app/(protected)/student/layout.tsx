"use client";

import { StudentSidebar } from "@/features/student/ui/StudentSidebar";
import { StudentNavbar } from "@/features/student/ui/StudentNavbar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans">
      <div className="hidden lg:block">
        <StudentSidebar />
      </div>
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <StudentNavbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
