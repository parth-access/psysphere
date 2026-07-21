"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu, ChevronRight, Bell } from "lucide-react";
import { usePathname } from "next/navigation";

export function StudentNavbar() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);
  
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
          <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full"></span>
          </button>
          <div className="w-px h-6 bg-gray-200 mx-2"></div>
          <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 border border-gray-200" } }} />
        </div>
      </div>
    </header>
  );
}
