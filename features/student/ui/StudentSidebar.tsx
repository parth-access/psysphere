"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpen, 
  UserCircle, 
  HelpCircle,
  LogOut
} from "lucide-react";
import { signOutAction } from "@/src/domains/auth/actions";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "Schedule", href: "/student/schedule", icon: CalendarDays },
  { label: "Resources", href: "/student/resources", icon: BookOpen },
  { label: "Profile", href: "/student/profile", icon: UserCircle },
  { label: "Support", href: "/student/support", icon: HelpCircle },
];

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-[#FDFBF7] border-r border-gray-200 flex flex-col fixed left-0 top-0 pt-6 pb-6">
      <div className="px-6 mb-8">
        <h1 className="text-xl font-serif font-bold text-gray-900 tracking-tight">PsySphere</h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">Student Workspace</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/student" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-white text-brand-primary shadow-sm border border-gray-100" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-brand-primary" : "text-gray-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <button 
          onClick={async () => {
            await signOutAction();
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50/50 w-full transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  );
}
