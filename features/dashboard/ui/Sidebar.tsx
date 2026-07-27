"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  BookOpen, 
  CalendarDays, 
  Settings,
  LogOut,
  GraduationCap
} from "lucide-react";
import { signOutAction } from "@/src/domains/auth/actions";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Admissions", href: "/dashboard/admissions", icon: CalendarDays },
  { label: "Students", href: "/dashboard/students", icon: Users },
  { label: "Teachers", href: "/dashboard/teachers", icon: GraduationCap },
  { label: "Batches", href: "/dashboard/batches", icon: Layers },
  { label: "Classes", href: "/dashboard/classes", icon: BookOpen },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ userProfile }: { userProfile?: { fullName: string; role: string } | null }) {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-[#FDFBF7] border-r border-gray-200 flex flex-col fixed left-0 top-0 pt-6 pb-6">
      <div className="px-6 mb-8">
        <h1 className="text-xl font-serif font-bold text-gray-900 tracking-tight">PsySphere</h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">OS Dashboard</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
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

      {userProfile && (
        <div className="mx-4 mb-4 p-3 bg-[#F5F2EC]/50 border border-gray-100 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
            {userProfile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate">{userProfile.fullName}</p>
            <p className="text-[10px] text-gray-500 capitalize">{userProfile.role}</p>
          </div>
        </div>
      )}

      <div className="px-4">
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
