import { NextRequest, NextResponse } from "next/server";
import { sendWeeklyReports } from "@/src/domains/reports/weekly";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Called by Vercel Cron every Sunday (see vercel.json). Vercel sends "Authorization: Bearer $CRON_SECRET". */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await sendWeeklyReports();
  console.log("[weekly report]", result);
  return NextResponse.json(result);
}
