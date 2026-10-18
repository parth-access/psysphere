import { db } from "./index";
import { profiles } from "./schema/core/profiles";
import { studentProfiles } from "./schema/core/studentProfiles";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding database...");

  // 1. Clear existing
  await db.delete(studentProfiles);
  await db.delete(profiles);

  // 2. Add Teachers
  const [t1] = await db.insert(profiles).values({
    id: "10000000-0000-0000-0000-000000000001",
    role: "teacher",
    fullName: "Dravina Gupta",
    email: "dravina@saarthilife.com"
  }).returning();

  const [t2] = await db.insert(profiles).values({
    id: "10000000-0000-0000-0000-000000000002",
    role: "teacher",
    fullName: "Dr. Sharma",
    email: "sharma@saarthilife.com"
  }).returning();


  // 4. Add Students
  const [s1] = await db.insert(profiles).values({
    id: "20000000-0000-0000-0000-000000000001",
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
    id: "20000000-0000-0000-0000-000000000002",
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
