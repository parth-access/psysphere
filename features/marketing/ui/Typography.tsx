import { ReactNode } from 'react';

export function H1({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={`font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-brand-text leading-[1.1] ${className}`}>
      {children}
    </h1>
  );
}

export function H2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`font-serif text-4xl md:text-5xl font-semibold tracking-tight text-brand-text leading-[1.15] ${className}`}>
      {children}
    </h2>
  );
}

export function H3({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`font-sans text-xl md:text-2xl font-semibold tracking-tight text-brand-text leading-snug ${className}`}>
      {children}
    </h3>
  );
}

export function Body({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-sans text-base md:text-lg text-brand-text-muted leading-relaxed ${className}`}>
      {children}
    </p>
  );
}
