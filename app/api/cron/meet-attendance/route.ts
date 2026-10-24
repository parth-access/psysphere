import { NextRequest, NextResponse } from "next/server";
import { syncRecentClasses } from "@/src/domains/attendance/meetSync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Called by Vercel Cron every night (see vercel.json). Takes the final Meet attendance for any class
 * nobody opened afterwards. Pages read Meet themselves during and right after class.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await syncRecentClasses();
  console.log("[meet attendance]", result);
  return NextResponse.json(result);
}
