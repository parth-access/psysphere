import { db } from "@/db";
import { prospectTokens } from "@/db/schema/core/tokens";
import { admissions } from "@/db/schema/core/admissions";
import crypto from "crypto";
import { eq, and, gt } from "drizzle-orm";

/**
 * Hash a raw token using SHA-256 for secure database persistence/lookup.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export class ProspectTokenService {
  /**
   * Generates a secure, random prospect token and persists its SHA-256 hash.
   * Returns the raw token which is NEVER stored or logged.
   */
  async generateToken(admissionId: string, durationDays: number = 7): Promise<string> {
    // Generate 32 secure random bytes
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    
    // Set expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Delete existing tokens for this admission to avoid pollution
    await db.delete(prospectTokens).where(eq(prospectTokens.admissionId, admissionId));

    // Persist hash
    await db.insert(prospectTokens).values({
      admissionId,
      tokenHash,
      expiresAt,
    });

    return rawToken;
  }

  /**
   * Verifies a raw token by hashing it and looking up its active record in the DB.
   * Returns the full admission record if valid, otherwise null.
   */
  async verifyToken(rawToken: string) {
    if (!rawToken || typeof rawToken !== "string") {
      return null;
    }

    const tokenHash = hashToken(rawToken);
    const now = new Date();

    // Find token in db
    const [tokenRecord] = await db
      .select()
      .from(prospectTokens)
      .where(
        and(
          eq(prospectTokens.tokenHash, tokenHash),
          gt(prospectTokens.expiresAt, now)
        )
      );

    if (!tokenRecord) {
      return null;
    }

    // Retrieve associated admission record
    const [admission] = await db
      .select()
      .from(admissions)
      .where(eq(admissions.id, tokenRecord.admissionId));

    return admission || null;
  }
}

export const prospectTokenService = new ProspectTokenService();
