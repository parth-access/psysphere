/* eslint-disable @next/next/no-img-element */
import { SITE } from '@/constants/site';

/**
 * Saarthi Ψ logo plus the "Saarthi Classes" wordmark.
 * On dark backgrounds the logo sits on a light disc so it stays legible.
 */
export function Logo({ tone = 'ink', compact = false }: { tone?: 'ink' | 'paper'; compact?: boolean }) {
  const img = <img src={SITE.logoUrl} alt="" width={40} height={40} className="h-10 w-10 object-contain" />;
  return (
    <span className="flex items-center gap-2.5">
      {tone === 'paper' ? <span className="rounded-full bg-paper p-1">{img}</span> : img}
      {!compact && (
        <span className={`flex flex-col leading-none ${tone === 'ink' ? 'text-ink-900' : 'text-paper'}`}>
          <span className="font-serif text-[22px]">Saarthi</span>
          <span className={`text-[10px] font-bold uppercase tracking-[0.22em] ${tone === 'ink' ? 'text-forest-800' : 'text-gold-400'}`}>
            Classes
          </span>
        </span>
      )}
      {compact && <span className="sr-only">Saarthi Classes</span>}
    </span>
  );
}
