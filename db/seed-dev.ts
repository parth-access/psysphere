/**
 * Sample data for the local development database (see README > Local database).
 * Adds a teacher, two Class 11 batches (one needs approval, one is open) and an upcoming free workshop.
 * Safe to re-run: rows use fixed ids and are reset to these values each time.
 *
 *   npm run db:seed:dev
 */
import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index";
import { profiles } from "./schema/core/profiles";
import { batches } from "./schema/core/batches";
import { workshops } from "./schema/core/workshops";

const TEACHER_ID = "d0000000-0000-4000-8000-000000000001";
const APPROVAL_BATCH_ID = "d0000000-0000-4000-8000-000000000011";
const OPEN_BATCH_ID = "d0000000-0000-4000-8000-000000000012";
const WORKSHOP_ID = "d0000000-0000-4000-8000-000000000021";

/** 5:00 pm India time on the next Saturday at least two days away. */
function nextWorkshopStart(now: Date) {
  const ist = new Date(now.getTime() + 330 * 60_000);
  let days = (6 - ist.getUTCDay() + 7) % 7;
  if (days < 2) days += 7;
  const date = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + days));
  return new Date(`${date.toISOString().slice(0, 10)}T17:00:00+05:30`);
}

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "postgres://missing");
  if (!["localhost", "127.0.0.1", "::1"].includes(url.hostname)) {
    throw new Error(`Refusing to seed ${url.hostname}: this script is only for a local database.`);
  }

  // profiles.id references auth.users, which db/local-setup.sql stubs locally.
  await db.execute(sql`
    insert into auth.users (id, email) values (${TEACHER_ID}, 'dravina.dev@example.com')
    on conflict (id) do nothing
  `);

  await db
    .insert(profiles)
    .values({ id: TEACHER_ID, role: "teacher", fullName: "Dravina Gupta", email: "dravina.dev@example.com" })
    .onConflictDoUpdate({ target: profiles.id, set: { role: "teacher", fullName: "Dravina Gupta", isActive: true } });

  const sampleBatches = [
    {
      id: APPROVAL_BATCH_ID,
      name: "Class 11 · Evening",
      schedule: "Mon, Wed, Fri · 6:00–7:00 pm",
      capacity: 12,
      joinMode: "approval" as const,
    },
    {
      id: OPEN_BATCH_ID,
      name: "Class 11 · Weekend",
      schedule: "Sat & Sun · 11:00 am–12:30 pm",
      capacity: 20,
      joinMode: "open" as const,
    },
  ];
  for (const b of sampleBatches) {
    const values = {
      ...b,
      classLevel: "class_11" as const,
      academicYear: "2026-27",
      teacherId: TEACHER_ID,
      isActive: true,
      acceptingStudents: true,
    };
    await db.insert(batches).values(values).onConflictDoUpdate({ target: batches.id, set: { ...values, updatedAt: new Date() } });
  }

  const startsAt = nextWorkshopStart(new Date());
  const workshop = {
    id: WORKSHOP_ID,
    title: "How memory works, and how to revise with it",
    description:
      "A one-hour class on the Human Memory chapter: how we encode, store and recall, and why spaced revision beats cramming. We finish with a board-style 5-mark answer you can reuse.",
    classLevel: null,
    startsAt,
    endsAt: new Date(startsAt.getTime() + 60 * 60_000),
    capacity: 30,
    meetingUrl: "https://meet.google.com/abc-defg-hij",
    isPublished: true,
  };
  await db.insert(workshops).values(workshop).onConflictDoUpdate({ target: workshops.id, set: { ...workshop, updatedAt: new Date() } });

  console.log("Seeded 1 teacher, 2 batches (approval + open) and 1 workshop on", startsAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
