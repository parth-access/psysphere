import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { getRequestByPayToken } from "@/src/domains/joining/service";
import { PublicShell, Eyebrow } from "@/features/joining/ui/PublicShell";
import { PayButton } from "@/features/joining/ui/PayButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Complete payment | Saarthi Classes", robots: { index: false } };

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function Message({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <PublicShell>
      <div className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-8">
        {icon}
        <h1 className="font-serif text-3xl font-semibold">{title}</h1>
        <div className="text-ink-500">{children}</div>
      </div>
    </PublicShell>
  );
}

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await getRequestByPayToken(token);

  if (!found) {
    return (
      <Message icon={<AlertCircle className="h-10 w-10 text-rose-600" aria-hidden="true" />} title="This link isn’t valid">
        <p>It may have already been used. If you’ve paid, check your email for your login details. Otherwise, reply to your approval email and we’ll send a new link.</p>
      </Message>
    );
  }

  const r = found.request;
  if (r.status === "paid" || r.status === "enrolled") {
    return (
      <Message icon={<CheckCircle2 className="h-10 w-10 text-sage-600" aria-hidden="true" />} title="Already paid">
        <p>Your seat is confirmed. Check your email to set your password, then <Link className="font-semibold underline" href="/sign-in">sign in</Link>.</p>
      </Message>
    );
  }
  if (r.status !== "approved" || found.expired) {
    return (
      <Message icon={<AlertCircle className="h-10 w-10 text-rose-600" aria-hidden="true" />} title="This link has expired">
        <p>Payment links are valid for 7 days. Reply to your approval email or <Link className="font-semibold underline" href="/contact">contact us</Link> for a new one.</p>
      </Message>
    );
  }

  return (
    <PublicShell>
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <header className="flex flex-col gap-3">
          <Eyebrow>Last step</Eyebrow>
          <h1 className="font-serif text-4xl font-semibold leading-tight">Confirm your seat, {r.studentName.split(" ")[0]}</h1>
        </header>
        <div className="flex flex-col gap-5 rounded-2xl bg-ink-900 p-6 text-paper">
          <dl className="flex flex-col gap-2 text-[15px]">
            <div className="flex justify-between gap-4"><dt className="text-ink-300">Batch</dt><dd className="text-right">{found.batchName}</dd></div>
            {found.schedule && <div className="flex justify-between gap-4"><dt className="text-ink-300">Timings</dt><dd className="text-right">{found.schedule}</dd></div>}
            <div className="flex justify-between gap-4"><dt className="text-ink-300">Plan</dt><dd className="text-right">{r.planName}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink-300">Student</dt><dd className="text-right">{r.studentName} · {r.email}</dd></div>
          </dl>
          <div className="flex items-baseline justify-between border-t border-ink-700 pt-4">
            <span className="text-ink-300">To pay</span>
            <span className="font-serif text-3xl font-semibold">{inr(r.amountInr)}</span>
          </div>
          <PayButton token={token} label={`Pay ${inr(r.amountInr)}`} />
        </div>
        <p className="text-sm text-ink-500">
          After payment your student account is created automatically and you’ll get an email to set your password.
          See our <Link href="/refund-policy" className="underline">refund policy</Link>.
        </p>
      </div>
    </PublicShell>
  );
}
