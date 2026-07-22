import { db } from "@/db";
import { admissions } from "@/db/schema/core/admissions";
import { eq, desc } from "drizzle-orm";

export class AdmissionRepository {
  async findAll() {
    return await db.select().from(admissions).orderBy(desc(admissions.createdAt));
  }

  async findById(id: string) {
    const result = await db.select().from(admissions).where(eq(admissions.id, id));
    return result[0];
  }

  async updateStatus(id: string, status: any) {
    return await db.update(admissions)
      .set({ status, updatedAt: new Date() })
      .where(eq(admissions.id, id))
      .returning();
  }

  async updateDemoDetails(id: string, teacherId: string, demoDate: string) {
    return await db.update(admissions)
      .set({ assignedTeacher: teacherId, demoDate, updatedAt: new Date() })
      .where(eq(admissions.id, id))
      .returning();
  }
}

export const admissionRepository = new AdmissionRepository();
