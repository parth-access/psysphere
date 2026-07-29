import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  await enforcePageRole([ROLES.ADMIN]);
  redirect("/dashboard");
}
