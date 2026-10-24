import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { getIdentityUrl } from "@/server/integrations/google";

export const dynamic = "force-dynamic";

/** "Continue with Google" on the log in page. Google sends people back to the shared callback, which spots the login cookie. */
export async function GET(req: Request) {
  try {
    const state = `login.${crypto.randomBytes(16).toString("hex")}`;
    (await cookies()).set("google_login_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600 });
    return NextResponse.redirect(getIdentityUrl(state));
  } catch (err) {
    console.error("[google login] could not start", err);
    return NextResponse.redirect(new URL("/sign-in?google=failed", req.url));
  }
}
