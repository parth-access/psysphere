import { requireRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  await requireRole([ROLES.ADMIN]);
  redirect("/dashboard");
}
