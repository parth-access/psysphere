import Link from 'next/link';
import { PublicShell } from '@/features/joining/ui/PublicShell';

export default function NotFound() {
  return (
    <PublicShell>
      <div className="mx-auto flex max-w-xl flex-col gap-4 py-12">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-marigold-700">404</p>
        <h1 className="font-serif text-4xl font-semibold">This page doesn’t exist</h1>
        <p className="text-ink-500">The link may be old or mistyped. Here are some places to go instead:</p>
        <ul className="flex flex-wrap gap-3">
          <li><Link href="/" className="inline-flex min-h-12 items-center rounded-xl bg-ink-900 px-6 font-semibold text-paper hover:bg-ink-700">Home</Link></li>
          <li><Link href="/workshops" className="inline-flex min-h-12 items-center rounded-xl border border-ink-900 px-6 font-semibold hover:bg-ink-100">Free workshops</Link></li>
          <li><Link href="/contact" className="inline-flex min-h-12 items-center rounded-xl border border-line px-6 font-semibold hover:bg-paper-deep">Contact</Link></li>
        </ul>
      </div>
    </PublicShell>
  );
}
