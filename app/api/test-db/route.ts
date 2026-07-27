// app/api/test-db/route.ts

import { db } from "@/server/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT current_database(), current_user, version();
    `);

    return Response.json(result);
  } catch (e) {
    console.error(e);
    return Response.json(e, { status: 500 });
  }
}