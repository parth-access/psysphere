export const isUuid = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export const formatIST = (d: Date | null | undefined, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }) =>
  d ? d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", ...opts }) : "";

const DAY = 86_400_000;
const IST_OFFSET = 330 * 60_000;

/** Midnight in India for the day containing `d`, as a UTC instant. Servers run in UTC, so never use setHours. */
export function istDayStart(d: Date) {
  const t = d.getTime() + IST_OFFSET;
  return new Date(t - (t % DAY) - IST_OFFSET);
}

/** Hour of the day (0-23) in India. */
export const istHour = (d: Date) => new Date(d.getTime() + IST_OFFSET).getUTCHours();

/** True when both instants fall on the same calendar day in India. */
export const sameIstDay = (a: Date, b: Date) => istDayStart(a).getTime() === istDayStart(b).getTime();

/** "YYYY-MM-DD" and "HH:MM" in India time, for date and time inputs. */
export const istDateInput = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
export const istTimeInput = (d: Date) =>
  d.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
