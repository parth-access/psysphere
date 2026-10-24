import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema/core/profiles";
import { getProfile } from "@/server/authorization/getProfile";
import { signedAvatarUrl } from "@/src/domains/profile/avatars";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";

/**
 * A person's profile photo, for signed-in users only. Redirects to a signed link that lasts an hour;
 * the browser keeps the redirect for 50 minutes. Links carry ?v=<file name>, so a new photo shows at once.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getProfile();
  if (!me || !me.isActive) return new NextResponse("Not signed in", { status: 401 });
  if (!isUuid(id)) return new NextResponse("Not found", { status: 404 });

  const [p] = await db.select({ path: profiles.avatarUrl }).from(profiles).where(eq(profiles.id, id));
  if (!p?.path) return new NextResponse("Not found", { status: 404 });

  try {
    const res = NextResponse.redirect(await signedAvatarUrl(p.path), 307);
    res.headers.set("Cache-Control", "private, max-age=3000");
    return res;
  } catch (err) {
    console.error("[avatars]", err);
    return new NextResponse("Not found", { status: 404 });
  }
}
