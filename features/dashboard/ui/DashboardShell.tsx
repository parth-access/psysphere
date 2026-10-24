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
  Inbox,
  IndianRupee,
  CalendarCheck,
  ClipboardList,
  FolderOpen,
  UserRound,
  Timer,
} from "lucide-react";
import { signOutAction } from "@/src/domains/auth/actions";
import { Logo } from "@/features/marketing/ui/Logo";
import { PendingButton } from "@/features/shared/ui/PendingButton";

type Profile = { fullName: string; role: string } | null | undefined;

const NAV_ITEMS = [
  { label: "Today", href: "/dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { label: "Today", href: "/dashboard/teacher", icon: LayoutDashboard, roles: ["teacher"] },
  { label: "Today", href: "/dashboard/student", icon: LayoutDashboard, roles: ["student"] },
  { label: "Workshops", href: "/dashboard/workshops", icon: Sparkles, roles: ["admin"] },
  { label: "Join requests", href: "/dashboard/join-requests", icon: UserPlus, roles: ["admin"] },
  { label: "Messages", href: "/dashboard/messages", icon: Inbox, roles: ["admin"] },
  { label: "Payments", href: "/dashboard/payments", icon: IndianRupee, roles: ["admin"] },
  { label: "Students", href: "/dashboard/students", icon: Users, roles: ["admin"] },
  { label: "Batches", href: "/dashboard/batches", icon: Layers, roles: ["admin"] },
  { label: "Classes", href: "/dashboard/classes", icon: BookOpen, roles: ["admin", "teacher"] },
  { label: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck, roles: ["admin", "teacher"] },
  { label: "Assignments", href: "/dashboard/assignments", icon: ClipboardList, roles: ["admin", "teacher", "student"] },
  { label: "Tests", href: "/dashboard/tests", icon: Timer, roles: ["admin", "teacher", "student"] },
  { label: "Study material", href: "/dashboard/materials", icon: FolderOpen, roles: ["admin", "teacher", "student"] },
  { label: "My classes", href: "/dashboard/my-classes", icon: BookOpen, roles: ["student"] },
  { label: "Fees & payments", href: "/dashboard/my-payments", icon: IndianRupee, roles: ["student"] },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound, roles: ["admin", "teacher", "student"] },
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
    <div className="flex h-full flex-col gap-8 bg-forest-950 px-4 py-6 text-paper/70">
      <Link href="/" className="px-2" onClick={onNavigate} aria-label="Saarthi Classes home">
        <Logo tone="paper" />
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
              className={`flex min-h-11 items-center gap-3 rounded-full px-4 text-[15px] font-semibold transition-colors ${
                active ? "bg-forest-800 text-paper shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]" : "hover:bg-paper/5 hover:text-paper"
              }`}
            >
              <item.icon className={`h-[18px] w-[18px] ${active ? "text-gold-400" : ""}`} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {profile && (
        <div className="flex items-center gap-3 rounded-[20px] bg-paper/5 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-900">
            {initials(profile.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-paper">{profile.fullName}</p>
            <p className="text-xs capitalize">{profile.role}</p>
          </div>
          <form action={signOutAction}>
            <PendingButton iconOnly aria-label="Log out" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-paper/10 hover:text-paper">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </PendingButton>
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
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
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
          <Logo />
        </header>
        <main id="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
