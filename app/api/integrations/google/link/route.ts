import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireRole } from "@/server/authorization/requireRole";
import { getIdentityUrl } from "@/server/integrations/google";

export const dynamic = "force-dynamic";

/** Starts "Link Google account" for a student. Google sends them back to the shared callback, which spots the link cookie. */
export async function GET(req: Request) {
  try {
    await requireRole(["student"]);
  } catch {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  const state = `link.${crypto.randomBytes(16).toString("hex")}`;
  (await cookies()).set("google_link_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600 });
  return NextResponse.redirect(getIdentityUrl(state));
}
