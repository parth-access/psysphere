import { sql } from "drizzle-orm";
import { db } from "@/db";

/** What Supabase's free plan includes. Update this if the plan changes. */
export const FREE_STORAGE_BYTES = 1024 * 1024 * 1024;

/** Total size of every uploaded file, or null if it can't be read. */
export async function storageUsedBytes(): Promise<number | null> {
  try {
    const rows = await db.execute<{ bytes: string }>(sql`select coalesce(sum((metadata->>'size')::bigint), 0) as bytes from storage.objects`);
    return Number(rows[0]?.bytes ?? 0);
  } catch (err) {
    console.error("[storage] could not read usage:", err);
    return null;
  }
}
