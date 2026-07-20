import { ReactNode } from 'react';

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-semibold tracking-wide uppercase ${className}`}>
      {children}
    </span>
  );
}
