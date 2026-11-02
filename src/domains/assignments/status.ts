type Assignment = { dueAt: Date; allowLate: boolean; resultsPublishedAt: Date | null };
type Attempt = { submittedAt: Date | null } | null | undefined;

export const isLate = (a: Pick<Assignment, "dueAt">, attempt: Attempt) => !!attempt?.submittedAt && attempt.submittedAt > a.dueAt;

/** Nothing new comes in once results are out, or after the due date when late work is switched off. */
export const isClosed = (a: Assignment, now = new Date()) => !!a.resultsPublishedAt || (!a.allowLate && a.dueAt < now);

export type StudentStatus = "To do" | "Overdue" | "Missed" | "Submitted" | "Late" | "Checked";

export function studentStatus(a: Assignment, attempt: Attempt, checked: boolean, now = new Date()): StudentStatus {
  if (a.resultsPublishedAt && checked) return "Checked";
  if (attempt?.submittedAt) return isLate(a, attempt) ? "Late" : "Submitted";
  if (isClosed(a, now)) return "Missed";
  return a.dueAt < now ? "Overdue" : "To do";
}

export const STATUS_STYLE: Record<StudentStatus, string> = {
  "To do": "bg-marigold-100 text-gold-700",
  Overdue: "bg-rose-100 text-rose-600",
  Missed: "bg-rose-100 text-rose-600",
  Submitted: "bg-sage-100 text-sage-600",
  Late: "bg-marigold-100 text-gold-700",
  Checked: "bg-ink-100 text-ink-700",
};

/** Due-date inputs work in India time whatever the server's clock zone: "2026-11-02" and "21:00". */
export function istInputs(d: Date) {
  const s = new Date(d.getTime() + 330 * 60_000).toISOString();
  return { date: s.slice(0, 10), time: s.slice(11, 16) };
}
