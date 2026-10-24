import { and, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { joinRequests } from "@/db/schema/core/joinRequests";
import { batches } from "@/db/schema/core/batches";

const PAID = ["paid", "enrolled"] as const;

export async function listPayments(filter?: { profileId: string; email: string }) {
  const paid = inArray(joinRequests.status, [...PAID]);
  return db
    .select({ r: joinRequests, batchName: batches.name })
    .from(joinRequests)
    .innerJoin(batches, eq(batches.id, joinRequests.batchId))
    .where(filter ? and(paid, or(eq(joinRequests.studentProfileId, filter.profileId), eq(joinRequests.email, filter.email))) : paid)
    .orderBy(desc(joinRequests.paidAt));
}
