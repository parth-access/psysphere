import { requireRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { DashboardClient } from "../_components/DashboardClient";

export default async function StudentDashboardPage() {
  await requireRole([ROLES.STUDENT, ROLES.ADMIN]);
  return <DashboardClient role={ROLES.STUDENT} />;
}
