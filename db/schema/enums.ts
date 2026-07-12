import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "teacher",
  "student",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "excused",
]);

export const assignmentAttemptStatusEnum = pgEnum(
  "assignment_attempt_status",
  [
    "draft",
    "submitted",
    "late",
    "resubmitted",
  ]
);

export const announcementTargetEnum = pgEnum(
  "announcement_target",
  [
    "all",
    "batch",
    "class_level",
  ]
);