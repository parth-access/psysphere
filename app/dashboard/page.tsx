import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { getAdminOverview } from "@/src/domains/admin/overview";
import { AdminOverview } from "@/features/dashboard/ui/admin/AdminOverview";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const profile = await enforcePageRole([ROLES.ADMIN]);
  const data = await getAdminOverview();
  return <AdminOverview data={data} name={profile.fullName} />;
}
