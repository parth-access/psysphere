import { requireRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { DashboardClient } from "../_components/DashboardClient";

export default async function StudentDashboardPage() {
  const profile = await requireRole([ROLES.STUDENT, ROLES.ADMIN]);
  return <DashboardClient role={ROLES.STUDENT} userProfile={{ fullName: profile.fullName, email: profile.email }} />;
}
