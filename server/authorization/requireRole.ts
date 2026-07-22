import { requireProfile } from "./getProfile";
import { Role } from "./roles";
import { UnauthorizedRoleError } from "../errors";

export const requireRole = async (allowedRoles: Role[]) => {
  const profile = await requireProfile();

  if (!allowedRoles.includes(profile.role as Role)) {
    throw new UnauthorizedRoleError(
      `User role ${profile.role} is not authorized for this resource.`
    );
  }

  return profile;
};
