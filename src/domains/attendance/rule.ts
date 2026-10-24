/** A student is absent if they were away from class for this long in one go (late joining and leaving early count). */
export const AWAY_LIMIT_MINUTES = 10;

const MIN = 60_000;

export type Stretch = { start: Date; end: Date | null };

export type Verdict = {
  /** null while it's too early to say (the class began less than the limit ago and they haven't joined). */
  status: "present" | "absent" | null;
  minutesPresent: number;
  longestGapMinutes: number;
};

/**
 * Judges one student over the class window [from, to]. `to` is "now" while the class is on, so a student
 * who is currently away is counted as away up to this moment. Stretches without an end are still in the call.
 */
export function judge(stretches: Stretch[], from: Date, to: Date): Verdict {
  const a = from.getTime();
  const b = to.getTime();
  const clipped = stretches
    .map((s) => [Math.max(s.start.getTime(), a), Math.min((s.end ?? to).getTime(), b)] as const)
    .filter(([s, e]) => e > s)
    .sort((x, y) => x[0] - y[0]);

  // Merge overlaps (one person on two devices, or a quick rejoin).
  const merged: [number, number][] = [];
  for (const [s, e] of clipped) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }

  let present = 0;
  let longestGap = 0;
  let cursor = a;
  for (const [s, e] of merged) {
    longestGap = Math.max(longestGap, s - cursor);
    present += e - s;
    cursor = e;
  }
  longestGap = Math.max(longestGap, b - cursor);

  const minutesPresent = Math.round(present / MIN);
  const longestGapMinutes = Math.floor(longestGap / MIN);
  let status: Verdict["status"];
  if (longestGapMinutes >= AWAY_LIMIT_MINUTES) status = "absent";
  else if (merged.length) status = "present";
  else status = null;
  return { status, minutesPresent, longestGapMinutes };
}
