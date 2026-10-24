import { db } from "@/db";
import { googleCredentials } from "@/db/schema/system/googleCredentials";
import { requireRole } from "@/server/authorization/requireRole";
import { exchangeCode } from "@/server/integrations/google";
import { linkGoogleAccount } from "@/src/domains/attendance/googleLink";
import { signInWithGoogle } from "@/src/domains/auth/googleLogin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // "Continue with Google" on the log in page (started at /api/auth/google).
  if (state?.startsWith("login.")) {
    const cookieStore = await cookies();
    const expected = cookieStore.get("google_login_state")?.value;
    cookieStore.delete("google_login_state");
    if (!expected || state !== expected) return NextResponse.redirect(new URL("/sign-in?google=expired", req.url));
    if (!code) return NextResponse.redirect(new URL("/sign-in", req.url));
    const r = await signInWithGoogle(code);
    return NextResponse.redirect(new URL(r.ok ? "/dashboard" : `/sign-in?google=${r.reason}`, req.url));
  }

  // A student linking the Google account they join classes with (started at /api/integrations/google/link).
  if (state?.startsWith("link.")) {
    const cookieStore = await cookies();
    const expected = cookieStore.get("google_link_state")?.value;
    cookieStore.delete("google_link_state");
    const to = (q: string) => NextResponse.redirect(new URL(`/dashboard/profile?${q}`, req.url));
    if (!expected || state !== expected) return to("google_link=error&reason=state");
    if (!code) return to("google_link=cancelled");
    const r = await linkGoogleAccount(code);
    return to(r.ok ? "google_link=ok" : `google_link=error&reason=${r.reason}`);
  }

  try {
    // 1. Authenticate user as Admin
    await requireRole(["admin"]);

    // 2. Validate state against cookie to prevent CSRF
    const cookieStore = await cookies();
    const stateFromCookie = cookieStore.get("google_oauth_state")?.value;
    cookieStore.delete("google_oauth_state");

    if (!state || !stateFromCookie || state !== stateFromCookie) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?google_connect=error&error_message=Invalid+security+state", req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?google_connect=error&error_message=Missing+authorization+code", req.url)
      );
    }

    // 3. Exchange auth code for tokens and get the connected email
    const { email, tokens } = await exchangeCode(code);

    // 4. Securely persist in the database (enforcing one active system credential)
    await db.delete(googleCredentials);
    await db.insert(googleCredentials).values({
      accountEmail: email,
      accessToken: tokens.access_token || null,
      refreshToken: tokens.refresh_token!,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      scopes: tokens.scope || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.redirect(
      new URL("/dashboard/settings?google_connect=success", req.url)
    );
  } catch (error: any) {
    console.error("Google OAuth Callback Error:", error);
    const msg = encodeURIComponent(error.message || "Authentication failed");
    return NextResponse.redirect(
      new URL(`/dashboard/settings?google_connect=error&error_message=${msg}`, req.url)
    );
  }
}
