import { redirect } from "next/navigation";
import { getProfile } from "@/server/authorization/getProfile";
import { ROLES } from "@/server/authorization/roles";

export default async function DashboardRedirectPage() {
  const profile = await getProfile();

  if (!profile || !profile.isActive) {
    redirect("/sign-in");
  }

  if (profile.role === ROLES.TEACHER) {
    redirect("/dashboard/teacher");
  } else if (profile.role === ROLES.STUDENT) {
    redirect("/dashboard/student");
  } else if (profile.role === ROLES.ADMIN) {
    redirect("/dashboard/admin");
  } else {
    redirect("/sign-in");
  }
}
