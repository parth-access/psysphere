import { ReactNode } from 'react';

/** Small uppercase label above a heading. Set `tone="paper"` on dark sections. */
export function Eyebrow({ children, className = '', tone = 'ink' }: { children: ReactNode; className?: string; tone?: 'ink' | 'paper' }) {
  return (
    <p
      className={`inline-flex items-center gap-2 font-sans text-[12px] font-bold uppercase tracking-[0.16em] ${
        tone === 'ink' ? 'text-forest-800' : 'text-gold-400'
      } ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />
      {children}
    </p>
  );
}

/** Wrap a word in <em> to set it in green italic. */
export function H1({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h1
      className={`font-serif text-[52px] leading-[0.98] text-ink-900 sm:text-[68px] lg:text-[88px] [&_em]:text-forest-800 ${className}`}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`font-serif text-[40px] leading-[1.02] text-ink-900 sm:text-[52px] [&_em]:text-forest-800 ${className}`}>
      {children}
    </h2>
  );
}

export function H3({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`font-sans text-xl font-bold leading-snug tracking-tight text-ink-900 ${className}`}>{children}</h3>;
}

export function Body({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`font-sans text-[17px] leading-relaxed text-ink-500 ${className}`}>{children}</p>;
}

/** Handwritten margin note, like a teacher's annotation. Decorative; keep it short. */
export function Note({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`font-hand text-2xl font-bold leading-none text-gold-700 ${className}`}>{children}</span>;
}
