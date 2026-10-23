import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'info' | 'sage';
}

export const Badge = ({ children, className, variant = 'neutral', id, ...props }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center rounded-xl px-2 py-0.5 text-[11px] font-sans font-semibold tracking-wide transition-colors';
  
  const variants = {
    neutral: 'bg-brand-beige text-brand-charcoal-muted border border-brand-stone-soft/50',
    accent: 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20',
    success: 'bg-sage-100 text-sage-600 border border-sage-100/50',
    warning: 'bg-marigold-100 text-gold-700 border border-marigold-100/50',
    info: 'bg-ink-100 text-ink-700 border border-ink-100/50',
    sage: 'bg-brand-sage-light text-brand-sage border border-brand-sage/20',
  };

  return (
    <span
      id={id}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};
