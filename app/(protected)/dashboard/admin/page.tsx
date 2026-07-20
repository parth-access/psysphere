import { requireRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { DashboardClient } from "../_components/DashboardClient";

export default async function AdminDashboardPage() {
  await requireRole([ROLES.ADMIN]);
  return <DashboardClient role={ROLES.ADMIN} />;
}
