import { requireRole } from "@/server/authorization/requireRole";
import { getAuthorizationUrl } from "@/server/integrations/google";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Only admins are authorized to link the institutional Google account
    await requireRole(["admin"]);

    const state = uuidv4();
    const cookieStore = await cookies();
    cookieStore.set("google_oauth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    const authUrl = getAuthorizationUrl(state);
    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    console.error("Failed to initiate Google OAuth:", err);
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
 