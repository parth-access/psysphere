import { requireRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { DashboardClient } from "../_components/DashboardClient";

export default async function TeacherDashboardPage() {
  const profile = await requireRole([ROLES.TEACHER, ROLES.ADMIN]);
  return <DashboardClient role={ROLES.TEACHER} userProfile={{ fullName: profile.fullName, email: profile.email }} />;
}
