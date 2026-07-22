import { db } from "./index";
import { admissions } from "./schema/core/admissions";
import { profiles } from "./schema/core/profiles";
import { studentProfiles } from "./schema/core/studentProfiles";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding database...");

  // 1. Clear existing
  await db.delete(admissions);
  await db.delete(studentProfiles);
  await db.delete(profiles);

  // 2. Add Teachers
  const [t1] = await db.insert(profiles).values({
    clerkId: "teacher_1",
    role: "teacher",
    fullName: "Dravina Gupta",
    email: "dravina@psysphere.com"
  }).returning();

  const [t2] = await db.insert(profiles).values({
    clerkId: "teacher_2",
    role: "teacher",
    fullName: "Dr. Sharma",
    email: "sharma@psysphere.com"
  }).returning();

  // 3. Add Admissions (Leads)
  await db.insert(admissions).values([
    {
      studentName: "Rohan Sharma",
      parentName: "Rajeev Sharma",
      email: "rohan@example.com",
      phone: "+91 9876543210",
      class: "Class 12",
      program: "Standard",
      status: "LEAD",
    },
    {
      studentName: "Ananya Gupta",
      parentName: "Meera Gupta",
      email: "ananya@example.com",
      phone: "+91 9876543211",
      class: "Class 11",
      program: "CUET Prep",
      status: "DEMO_APPROVED",
      assignedTeacher: "Dravina Gupta",
      demoDate: "2026-07-15",
    },
    {
      studentName: "Vikram Singh",
      parentName: "Anita Singh",
      email: "vikram@example.com",
      phone: "+91 9876543212",
      class: "Class 12",
      program: "Standard",
      status: "DEMO_COMPLETED",
      assignedTeacher: "Dr. Sharma",
      demoDate: "2026-07-10",
    }
  ]);

  // 4. Add Students
  const [s1] = await db.insert(profiles).values({
    clerkId: "student_1",
    role: "student",
    fullName: "Rahul Verma",
    email: "rahul@example.com"
  }).returning();
  
  await db.insert(studentProfiles).values({
    profileId: s1.id,
    admissionNumber: "2024-001",
    guardianName: "Sunita Verma",
    guardianEmail: "sunita@example.com",
    guardianPhone: "+91 9876543213"
  });

  const [s2] = await db.insert(profiles).values({
    clerkId: "student_2",
    role: "student",
    fullName: "Priya Desai",
    email: "priya@example.com"
  }).returning();

  await db.insert(studentProfiles).values({
    profileId: s2.id,
    admissionNumber: "2024-002",
    guardianName: "Rajesh Desai",
    guardianEmail: "rajesh@example.com",
    guardianPhone: "+91 9876543214"
  });

  console.log("Database seeded.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
