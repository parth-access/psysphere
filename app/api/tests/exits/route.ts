import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/server/authorization/requireRole";
import { recordExit, recordReturn } from "@/src/domains/tests/service";

export const dynamic = "force-dynamic";

/**
 * Logs a student leaving or coming back to the test screen. Sent with navigator.sendBeacon,
 * which still delivers when the tab is being hidden or closed.
 */
const body = z.discriminatedUnion("event", [
  z.object({
    event: z.literal("left"),
    attemptId: z.string().uuid(),
    exitId: z.string().uuid(),
    reason: z.enum(["hidden", "blur", "fullscreen"]),
    questionId: z.string().uuid().nullable().optional(),
  }),
  z.object({ event: z.literal("returned"), attemptId: z.string().uuid(), exitId: z.string().uuid() }),
]);

export async function POST(req: NextRequest) {
  let me;
  try {
    me = await requireRole(["student"]);
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let parsed;
  try {
    parsed = body.safeParse(JSON.parse(await req.text()));
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const e = parsed.data;
  if (e.event === "left") await recordExit(e.attemptId, me.id, { id: e.exitId, reason: e.reason, questionId: e.questionId });
  else await recordReturn(e.attemptId, me.id, e.exitId);
  return NextResponse.json({ ok: true });
}
