/* eslint-disable @next/next/no-img-element */
import { SITE } from '@/constants/site';

/**
 * Saarthi logo plus the "Classes" label.
 * On dark backgrounds the logo sits on a light chip so it stays legible.
 */
export function Logo({ tone = 'ink', compact = false }: { tone?: 'ink' | 'paper'; compact?: boolean }) {
  const img = <img src={SITE.logoUrl} alt="Saarthi" width={120} height={36} className="h-8 w-auto" />;
  return (
    <span className="flex items-center gap-2.5">
      {tone === 'paper' ? <span className="rounded-lg bg-paper px-2 py-1">{img}</span> : img}
      {!compact && (
        <span
          className={`border-l pl-2.5 font-serif text-lg font-semibold leading-none tracking-tight ${
            tone === 'ink' ? 'border-line text-ink-900' : 'border-ink-700 text-paper'
          }`}
        >
          Classes
        </span>
      )}
    </span>
  );
}
