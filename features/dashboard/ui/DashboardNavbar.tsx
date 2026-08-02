"use client";

import { Menu, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export function DashboardNavbar({ userProfile }: { userProfile?: { fullName: string; role: string } | null }) {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);
  
  const initials = userProfile?.fullName
    ? userProfile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : "A";
  
  return (
    <header className="h-16 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Breadcrumbs (Desktop) */}
          <div className="hidden lg:flex items-center text-sm font-medium text-gray-500 capitalize">
            {paths.map((path, index) => (
              <div key={path} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />}
                <span className={index === paths.length - 1 ? "text-gray-900" : ""}>
                  {path.replace(/-/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-medium text-gray-600">{userProfile?.fullName || "Admin"}</span>
            <div className="w-9 h-9 border border-gray-200 rounded-full bg-[#F5F2EC] flex items-center justify-center font-serif text-sm text-brand-charcoal font-medium select-none">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
