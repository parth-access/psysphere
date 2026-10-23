import Link from "next/link";
import { AlertCircle, CheckCircle2, Inbox, KeyRound, LogIn, MailCheck, PartyPopper } from "lucide-react";
import { Eyebrow } from "@/features/marketing/ui/Typography";
import { APPROVAL_STEPS, JourneySteps, OPEN_STEPS } from "./JoinPaths";
import { PayButton } from "./PayButton";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function NextList({ items }: { items: { icon: typeof Inbox; title: string; desc: string }[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {items.map(({ icon: Icon, ...it }) => (
        <li key={it.title} className="flex gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-800" aria-hidden="true">
            <Icon className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold text-ink-900">{it.title}</span>
            <span className="block text-[15px] text-ink-500">{it.desc}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function Frame({ steps, current, children }: { steps: typeof APPROVAL_STEPS; current: number; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <div className="rounded-[24px] border border-line bg-surface p-5 sm:p-6">
        <JourneySteps steps={steps} current={current} />
      </div>
      {children}
    </div>
  );
}

export function RequestedView() {
  return (
    <Frame steps={APPROVAL_STEPS} current={1}>
      <div role="status" className="flex flex-col gap-4">
        <MailCheck className="h-12 w-12 text-forest-700" aria-hidden="true" />
        <Eyebrow>Request sent</Eyebrow>
        <h1 className="font-serif text-[44px] leading-[1] sm:text-[56px]">
          Your request is <em className="text-forest-800">with Dravina.</em>
        </h1>
        <p className="text-lg text-ink-500">There’s nothing to pay yet. Here’s what happens next.</p>
      </div>
      <div className="rounded-[28px] border border-line bg-surface p-7 sm:p-8">
        <NextList
          items={[
            { icon: Inbox, title: "Dravina looks at your request", desc: "She checks there’s a seat in the batch you chose." },
            { icon: MailCheck, title: "You get a payment link by email", desc: "The link stays valid for 7 days." },
            { icon: KeyRound, title: "Pay, and your account is ready", desc: "We email you a link to set your password and see your class timings." },
          ]}
        />
      </div>
      <p className="text-[15px] text-ink-500">
        While you wait,{" "}
        <Link href="/workshops" className="font-bold text-forest-800 underline decoration-gold-500 decoration-2 underline-offset-4">
          see upcoming free workshops
        </Link>
        .
      </p>
    </Frame>
  );
}

export type PayDetails = {
  firstName: string;
  studentName: string;
  email: string;
  batchName: string;
  schedule: string | null;
  planName: string;
  amountInr: number;
  /** True when the student went through approval first. */
  approved: boolean;
};

export function PayView({ token, d }: { token: string; d: PayDetails }) {
  const steps = d.approved ? APPROVAL_STEPS : OPEN_STEPS;
  return (
    <Frame steps={steps} current={d.approved ? 2 : 1}>
      <header className="flex flex-col gap-3">
        <Eyebrow>{d.approved ? "Approved" : "Last step"}</Eyebrow>
        <h1 className="font-serif text-[44px] leading-[1] sm:text-[56px]">
          Confirm your seat, <em className="text-forest-800">{d.firstName}.</em>
        </h1>
        {d.approved && <p className="text-lg text-ink-500">Dravina approved your request. Pay below to confirm your seat.</p>}
      </header>
      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <dl className="flex flex-col gap-4 rounded-[28px] border border-line bg-surface p-7">
          {[
            ["Student", `${d.studentName}`],
            ["Email", d.email],
            ["Batch", d.batchName],
            ...(d.schedule ? [["Timings", d.schedule]] : []),
            ["Plan", d.planName],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5">
              <dt className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-500">{k}</dt>
              <dd className="text-[16px] font-semibold text-ink-900">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-5 rounded-[28px] bg-forest-900 p-7 text-paper">
          <div>
            <p className="text-sm text-paper/65">To pay</p>
            <p className="font-sans text-[44px] font-semibold leading-none tracking-tight">{inr(d.amountInr)}</p>
          </div>
          <PayButton token={token} label={`Pay ${inr(d.amountInr)}`} />
        </div>
      </div>
      <p className="text-sm text-ink-500">
        After you pay we create your student account and email you a link to set your password. See our{" "}
        <Link href="/refund-policy" className="font-semibold text-forest-800 underline">refund policy</Link>.
      </p>
    </Frame>
  );
}

export function PayProblemView({ kind }: { kind: "invalid" | "expired" | "paid" }) {
  const copy = {
    invalid: {
      title: "This link isn’t valid",
      body: (
        <>It may have been used already. If you’ve paid, check your email for your login details. If not, reply to your approval email and we’ll send a new link.</>
      ),
    },
    expired: {
      title: "This link has expired",
      body: (
        <>
          Payment links stay valid for 7 days. Reply to your approval email or{" "}
          <Link className="font-semibold text-forest-800 underline" href="/contact">contact us</Link> for a new one.
        </>
      ),
    },
    paid: {
      title: "You’ve already paid",
      body: (
        <>
          Your seat is confirmed. Check your email for the link to set your password, then{" "}
          <Link className="font-semibold text-forest-800 underline" href="/sign-in">log in</Link>.
        </>
      ),
    },
  }[kind];
  const ok = kind === "paid";
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-[28px] border border-line bg-surface p-8 sm:p-10">
      {ok ? (
        <CheckCircle2 className="h-11 w-11 text-forest-700" aria-hidden="true" />
      ) : (
        <AlertCircle className="h-11 w-11 text-rose-600" aria-hidden="true" />
      )}
      <h1 className="font-serif text-[36px] leading-tight">{copy.title}</h1>
      <p className="text-[16px] leading-relaxed text-ink-500">{copy.body}</p>
    </div>
  );
}

export function SuccessView() {
  return (
    <Frame steps={OPEN_STEPS} current={OPEN_STEPS.length}>
      <div role="status" className="flex flex-col gap-4">
        <PartyPopper className="h-12 w-12 text-gold-600" aria-hidden="true" />
        <Eyebrow>Payment received</Eyebrow>
        <h1 className="font-serif text-[44px] leading-[1] sm:text-[60px]">
          Welcome to <em className="text-forest-800">Saarthi Classes.</em>
        </h1>
        <p className="text-lg text-ink-500">Your seat is confirmed. Three quick steps and you’re ready for your first class.</p>
      </div>
      <div className="rounded-[28px] border border-line bg-surface p-7 sm:p-8">
        <NextList
          items={[
            { icon: MailCheck, title: "Open the email from us", desc: "It has a link to set your password. The link works for 24 hours." },
            { icon: KeyRound, title: "Set your password", desc: "Use the email address you joined with." },
            { icon: LogIn, title: "Log in to your dashboard", desc: "Your class timings, Google Meet links, assignments and test results are all there." },
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/sign-in" className="inline-flex min-h-12 items-center rounded-full bg-forest-800 px-7 font-bold text-paper hover:bg-forest-900">
          Go to log in
        </Link>
        <p className="text-sm text-ink-500">Link expired? Use “Forgot password” on the log-in page.</p>
      </div>
    </Frame>
  );
}
