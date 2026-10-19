import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { studyMaterials } from "@/db/schema/academic/studyMaterials";
import { getProfile } from "@/server/authorization/getProfile";
import { canAccessBatch } from "@/server/authorization/access";
import { signedMaterialUrl } from "@/src/domains/materials/storage";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";

/** Checks the viewer may see the file, then redirects to a 60-second signed download link. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getProfile();
  if (!me || !me.isActive) return NextResponse.redirect(new URL("/sign-in", req.url));
  if (!isUuid(id)) return new NextResponse("Not found", { status: 404 });

  const [m] = await db.select().from(studyMaterials).where(eq(studyMaterials.id, id));
  if (!m || (m.batchId && !(await canAccessBatch(me, m.batchId)))) {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.redirect(await signedMaterialUrl(m.storagePath, m.fileName));
}
