"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Layers,
  BookOpen,
  Settings,
  LogOut,
  GraduationCap,
  Sparkles,
  UserPlus,
  Menu,
  X,
} from "lucide-react";
import { signOutAction } from "@/src/domains/auth/actions";

type Profile = { fullName: string; role: string } | null | undefined;

const NAV_ITEMS = [
  { label: "Today", href: "/dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { label: "Today", href: "/dashboard/teacher", icon: LayoutDashboard, roles: ["teacher"] },
  { label: "Today", href: "/dashboard/student", icon: LayoutDashboard, roles: ["student"] },
  { label: "Workshops", href: "/dashboard/workshops", icon: Sparkles, roles: ["admin"] },
  { label: "Join requests", href: "/dashboard/join-requests", icon: UserPlus, roles: ["admin"] },
  { label: "Students", href: "/dashboard/students", icon: Users, roles: ["admin"] },
  { label: "Batches", href: "/dashboard/batches", icon: Layers, roles: ["admin"] },
  { label: "Classes", href: "/dashboard/classes", icon: BookOpen, roles: ["admin", "teacher"] },
  { label: "Teachers", href: "/dashboard/teachers", icon: GraduationCap, roles: ["admin"] },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["admin"] },
];

function initials(name?: string) {
  return (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function SidebarContent({ profile, onNavigate }: { profile: Profile; onNavigate?: () => void }) {
  const pathname = usePathname();
  const role = profile?.role || "student";
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <div className="flex h-full flex-col gap-8 bg-ink-900 px-4 py-6 text-ink-300">
      <Link href="/" className="flex items-center gap-2.5 px-2 font-serif text-xl font-semibold text-paper" onClick={onNavigate}>
        <svg width="24" height="24" viewBox="0 0 28 28" aria-hidden="true">
          <circle cx="14" cy="14" r="12" fill="none" stroke="#FAF6EF" strokeWidth="2" />
          <path d="M6 18 C 11 18, 12 10, 18 10" fill="none" stroke="#FAF6EF" strokeWidth="2" strokeLinecap="round" />
          <circle cx="19" cy="10" r="2.5" fill="#E3962B" />
        </svg>
        Saarthi Classes
      </Link>

      <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (!["/dashboard", "/dashboard/teacher", "/dashboard/student"].includes(item.href) && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors ${
                active ? "bg-ink-700 text-paper" : "hover:bg-ink-700/60 hover:text-paper"
              }`}
            >
              <item.icon className={`h-[18px] w-[18px] ${active ? "text-marigold-500" : ""}`} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {profile && (
        <div className="flex items-center gap-3 rounded-xl bg-ink-700/50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marigold-500 text-xs font-bold text-ink-900">
            {initials(profile.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-paper">{profile.fullName}</p>
            <p className="text-xs capitalize">{profile.role}</p>
          </div>
          <form action={signOutAction}>
            <button type="submit" aria-label="Log out" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-ink-700 hover:text-paper">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function DashboardShell({ profile, children }: { profile: Profile; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarContent profile={profile} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink-900/50" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72 max-w-[85vw]">
            <SidebarContent profile={profile} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-ink-900 hover:bg-ink-100"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-serif text-lg font-semibold">Saarthi Classes</span>
        </header>
        <main id="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
