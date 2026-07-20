import { Role, ROLES } from "./roles";

export const canManageBatches = (role: Role): boolean => {
  return role === ROLES.ADMIN || role === ROLES.TEACHER;
};

export const canManageAssignments = (role: Role): boolean => {
  return role === ROLES.ADMIN || role === ROLES.TEACHER;
};

export const canGradeAssignments = (role: Role): boolean => {
  return role === ROLES.ADMIN || role === ROLES.TEACHER;
};

export const canUploadMaterials = (role: Role): boolean => {
  return role === ROLES.ADMIN || role === ROLES.TEACHER;
};

export const canViewAttendance = (role: Role): boolean => {
  // Everyone can view attendance, but students might only be able to view their own
  // This just checks the general permission
  return true;
};
