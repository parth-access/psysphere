import { DashboardShell } from "@/features/dashboard/ui/DashboardShell";
import { getCurrentProfile } from "@/src/domains/auth/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
