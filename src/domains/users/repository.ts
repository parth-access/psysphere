import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { studentProfiles } from "@/db/schema/core/studentProfiles";
import { eq } from "drizzle-orm";

export class UserRepository {
  async findAllStudents() {
    return await db.select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
      role: profiles.role,
      admissionNumber: studentProfiles.admissionNumber,
      enrollmentDate: studentProfiles.enrollmentDate
    })
    .from(profiles)
    .leftJoin(studentProfiles, eq(profiles.id, studentProfiles.profileId))
    .where(eq(profiles.role, "student"));
  }

  async findAllTeachers() {
    return await db.select()
      .from(profiles)
      .where(eq(profiles.role, "teacher"));
  }
}

export const userRepository = new UserRepository();
export const studentRepository = userRepository;
export const teacherRepository = userRepository;
