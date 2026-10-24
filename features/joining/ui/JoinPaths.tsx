import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

type Path = "workshop" | "direct";

const PATHS: { id: Path; title: string; blurb: string; steps: string[]; href: string; cta: string }[] = [
  {
    id: "workshop",
    title: "Try a free workshop first",
    blurb: "Sit in on a live class with Dravina, then decide.",
    steps: ["Reserve a free seat", "Attend live on Google Meet", "Join a batch if you liked it"],
    href: "/workshops",
    cta: "See free workshops",
  },
  {
    id: "direct",
    title: "Join a batch directly",
    blurb: "Already sure? Pick your course and batch now.",
    steps: ["Choose course, plan and batch", "Pay online through Razorpay", "Start your classes"],
    href: "/join",
    cta: "Join a batch",
  },
];

/** The two ways to start. The path for the current page is highlighted; the other one links across. */
export function JoinPaths({ current }: { current: Path }) {
  return (
    <section aria-label="Two ways to join" className="grid gap-4 sm:grid-cols-2">
      {PATHS.map((p, i) => {
        const here = p.id === current;
        const body = (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className={`text-[12px] font-bold uppercase tracking-[0.14em] ${here ? "text-gold-400" : "text-forest-800"}`}>
                Option {i + 1}
              </span>
              {here ? (
                <span className="rounded-full bg-paper/10 px-2.5 py-0.5 text-xs font-semibold text-paper">You’re here</span>
              ) : (
                <ArrowRight className="h-5 w-5 text-ink-500 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              )}
            </div>
            <h2 className="font-serif text-[26px] leading-tight">{p.title}</h2>
            <p className={`text-[15px] ${here ? "text-paper/75" : "text-ink-500"}`}>{p.blurb}</p>
            <ol className="mt-1 flex flex-col gap-2">
              {p.steps.map((s, n) => (
                <li key={s} className="flex items-center gap-3 text-[15px]">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      here ? "bg-gold-500 text-ink-900" : "bg-forest-50 text-forest-800"
                    }`}
                  >
                    {n + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            {!here && <span className="mt-2 text-sm font-bold text-forest-800">{p.cta}</span>}
          </>
        );
        return here ? (
          <div key={p.id} className="flex flex-col gap-3 rounded-[28px] bg-forest-900 p-6 text-paper sm:p-7">
            {body}
          </div>
        ) : (
          <Link
            key={p.id}
            href={p.href}
            className="group flex flex-col gap-3 rounded-[28px] border border-line bg-surface p-6 text-ink-900 transition-shadow hover:shadow-lift sm:p-7"
          >
            {body}
          </Link>
        );
      })}
    </section>
  );
}

export type JourneyStep = { label: string; detail?: string };

/** Progress through joining. Steps before `current` are done; `current` past the end means all done. */
export function JourneySteps({ steps, current }: { steps: JourneyStep[]; current: number }) {
  return (
    <ol aria-label="Joining steps" className="flex flex-col gap-0 sm:flex-row sm:gap-2">
      {steps.map((s, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li
            key={s.label}
            aria-current={now ? "step" : undefined}
            className="relative flex flex-1 gap-3 pb-5 last:pb-0 sm:flex-col sm:gap-2 sm:pb-0"
          >
            {i < steps.length - 1 && (
              <span
                className={`absolute left-[15px] top-8 h-[calc(100%-32px)] w-0.5 sm:left-10 sm:right-0 sm:top-[15px] sm:h-0.5 sm:w-auto ${
                  done ? "bg-forest-700" : "bg-line"
                }`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                done ? "bg-forest-700 text-paper" : now ? "bg-gold-500 text-ink-900 ring-4 ring-gold-100" : "border-2 border-line bg-surface text-ink-500"
              }`}
            >
              {done ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
            </span>
            <span className="flex flex-col pt-1 sm:pt-0 sm:pr-4">
              <span className={`text-sm font-semibold ${done || now ? "text-ink-900" : "text-ink-500"}`}>
                {s.label}
                <span className="sr-only">{done ? " (done)" : now ? " (current step)" : ""}</span>
              </span>
              {s.detail && <span className="text-[13px] text-ink-500">{s.detail}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Steps for a batch that needs approval, and for one students can pay for straight away. */
export const APPROVAL_STEPS: JourneyStep[] = [
  { label: "Request a seat" },
  { label: "Dravina approves", detail: "We email you when she does" },
  { label: "Pay online", detail: "Link valid for 7 days" },
  { label: "Start classes" },
];

export const OPEN_STEPS: JourneyStep[] = [
  { label: "Choose your batch" },
  { label: "Pay online", detail: "UPI, card, net banking" },
  { label: "Start classes" },
];

/** Calendar-style date block for workshop cards. */
export function DateTile({ date, tone = "mint" }: { date: Date; tone?: "mint" | "paper" }) {
  const part = (o: Intl.DateTimeFormatOptions) => date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", ...o });
  return (
    <span
      className={`flex h-[72px] w-[64px] shrink-0 flex-col items-center justify-center rounded-2xl ${tone === "mint" ? "bg-mint" : "bg-paper"}`}
      aria-hidden="true"
    >
      <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800">{part({ month: "short" })}</span>
      <span className="font-sans text-[26px] font-semibold leading-none text-ink-900">{part({ day: "numeric" })}</span>
      <span className="text-[11px] font-medium text-ink-700">{part({ weekday: "short" })}</span>
    </span>
  );
}
