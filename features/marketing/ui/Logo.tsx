/** Wordmark: a small chariot-path mark plus the name. */
export function Logo({ tone = 'ink' }: { tone?: 'ink' | 'paper' }) {
  const stroke = tone === 'ink' ? '#1C2541' : '#FAF6EF';
  return (
    <span className={`flex items-center gap-2.5 font-serif text-[22px] font-semibold tracking-tight ${tone === 'ink' ? 'text-ink-900' : 'text-paper'}`}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="14" r="12" fill="none" stroke={stroke} strokeWidth="2" />
        <path d="M6 18 C 11 18, 12 10, 18 10" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <circle cx="19" cy="10" r="2.5" fill="#E3962B" />
      </svg>
      Saarthi Classes
    </span>
  );
}
