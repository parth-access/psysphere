import { eq } from "drizzle-orm";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema/core/studentProfiles";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { DetailsForm, PasswordForm } from "@/features/dashboard/ui/ProfileForms";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const me = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);
  const [sp] = me.role === "student" ? await db.select().from(studentProfiles).where(eq(studentProfiles.profileId, me.id)) : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description={`${me.email}${sp?.admissionNumber ? ` · Student ID ${sp.admissionNumber}` : ""}`} />
      <div className="grid gap-8 lg:grid-cols-2">
        <DashboardCard title="Your details">
          <DetailsForm
            fullName={me.fullName}
            isStudent={me.role === "student"}
            guardian={sp ? { name: sp.guardianName, phone: sp.guardianPhone, email: sp.guardianEmail } : undefined}
          />
        </DashboardCard>
        <DashboardCard title="Password">
          <PasswordForm />
        </DashboardCard>
      </div>
    </div>
  );
}
