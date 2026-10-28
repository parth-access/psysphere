import { getProfile, getSessionUser, requireProfile } from "./getProfile";
import { Role } from "./roles";
import { UnauthorizedRoleError } from "../errors";
import { redirect } from "next/navigation";

export const requireRole = async (allowedRoles: Role[]) => {
  const profile = await requireProfile();

  if (!allowedRoles.includes(profile.role as Role)) {
    throw new UnauthorizedRoleError(
      `User role ${profile.role} is not authorized for this resource.`
    );
  }

  return profile;
};

export const enforcePageRole = async (allowedRoles: Role[]) => {
  const profile = await getProfile();
  if (!profile || !profile.isActive) {
    // Logged in to Supabase but with no usable profile: sending them to /sign-in alone would loop, as the
    // middleware sends logged-in people from /sign-in back to /dashboard. End the session first.
    if (await getSessionUser()) redirect(`/api/auth/end-session?reason=${profile ? "inactive" : "missing"}`);
    redirect("/sign-in");
  }

  if (!allowedRoles.includes(profile.role as Role)) {
    if (profile.role === "admin") {
      redirect("/dashboard");
    } else if (profile.role === "teacher") {
      redirect("/dashboard/teacher");
    } else if (profile.role === "student") {
      redirect("/dashboard/student");
    } else {
      redirect("/sign-in");
    }
  }

  return profile;
};
