import { eq } from "drizzle-orm";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema/core/studentProfiles";
import { PageHeader } from "@/features/dashboard/ui/PageHeader";
import { DashboardCard } from "@/features/dashboard/ui/DashboardCard";
import { DetailsForm, EmailForm, PasswordForm, PhotoForm } from "@/features/dashboard/ui/ProfileForms";
import { enforcePageRole } from "@/server/authorization/requireRole";
import { ROLES } from "@/server/authorization/roles";
import { pendingEmailChange } from "@/src/domains/profile/emailChange";
import { formatIST } from "@/lib/ids";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = { admin: "Admin", teacher: "Teacher", student: "Student" };

export default async function ProfilePage() {
  const me = await enforcePageRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);
  const [[sp], waiting] = await Promise.all([
    me.role === "student" ? db.select().from(studentProfiles).where(eq(studentProfiles.profileId, me.id)) : Promise.resolve([]),
    pendingEmailChange(me.id),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader title="Profile" description="Your photo, contact details and login." />

      <DashboardCard>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <PhotoForm id={me.id} name={me.fullName} photo={me.avatarUrl} />
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm lg:text-right">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500">Role</dt>
              <dd className="mt-0.5 font-semibold text-ink-900">{ROLE_LABEL[me.role] ?? me.role}</dd>
            </div>
            {sp?.admissionNumber && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500">Student ID</dt>
                <dd className="mt-0.5 font-semibold text-ink-900">{sp.admissionNumber}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500">Member since</dt>
              <dd className="mt-0.5 font-semibold text-ink-900">{formatIST(me.createdAt, { month: "long", year: "numeric" })}</dd>
            </div>
          </dl>
        </div>
      </DashboardCard>

      <div className="grid gap-8 lg:grid-cols-2">
        <DashboardCard title="Your details">
          <DetailsForm
            fullName={me.fullName}
            phone={me.phone}
            isStudent={me.role === "student"}
            guardian={sp ? { name: sp.guardianName, phone: sp.guardianPhone, email: sp.guardianEmail } : undefined}
          />
        </DashboardCard>
        <DashboardCard title="Login email">
          <EmailForm
            email={me.email}
            pending={waiting ? { newEmail: waiting.newEmail, sentAt: formatIST(waiting.createdAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) } : null}
          />
        </DashboardCard>
      </div>

      <DashboardCard title="Password" className="lg:max-w-[calc(50%-1rem)]">
        <PasswordForm />
      </DashboardCard>
    </div>
  );
}
