import { NextResponse } from "next/server";
import { createClient } from "@/src/domains/auth/server";

export const dynamic = "force-dynamic";

/**
 * Signs out a session that has no usable account behind it (no profile, or a switched-off one)
 * and shows the reason on the log in page. Reached from enforcePageRole.
 */
export async function GET(req: Request) {
  const reason = new URL(req.url).searchParams.get("reason") === "inactive" ? "inactive" : "missing";
  await (await createClient()).auth.signOut();
  return NextResponse.redirect(new URL(`/sign-in?account=${reason}`, req.url));
}
