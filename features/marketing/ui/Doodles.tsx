/** Hand-drawn marks used across the marketing pages. All decorative. */

export function Scribble({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 24" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d="M3 15 C 60 6, 120 5, 180 9 S 270 16, 297 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M40 20 C 110 13, 190 14, 262 17" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 60" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8 C 20 40, 44 50, 70 44" />
      <path d="M58 36 L 71 44 L 60 54" />
    </svg>
  );
}

export function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 0c.9 6.6 4.8 10.6 12 12-7.2 1.4-11.1 5.4-12 12-.9-6.6-4.8-10.6-12-12C7.2 10.6 11.1 6.6 12 0Z" />
    </svg>
  );
}

/** The Greek psi, Saarthi's mark, drawn as a line glyph for large watermarks. */
export function Psi({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
      <path d="M50 6 V 114" />
      <path d="M12 22 C 12 64, 26 78, 50 78 C 74 78, 88 64, 88 22" />
      <path d="M34 114 H 66" />
    </svg>
  );
}
