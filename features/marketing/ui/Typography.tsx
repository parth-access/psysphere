import { ReactNode } from 'react';

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-marigold-700 ${className}`}>
      {children}
    </p>
  );
}

export function H1({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={`font-serif text-[40px] font-semibold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-[64px] ${className}`}>
      {children}
    </h1>
  );
}

export function H2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-ink-900 sm:text-[40px] ${className}`}>
      {children}
    </h2>
  );
}

export function H3({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`font-sans text-xl font-semibold leading-snug text-ink-900 ${className}`}>{children}</h3>;
}

export function Body({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`font-sans text-[17px] leading-relaxed text-ink-500 ${className}`}>{children}</p>;
}
