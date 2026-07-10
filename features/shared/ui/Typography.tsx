import * as React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const H1 = ({ children, className, id, ...props }: TypographyProps) => {
  return (
    <h1
      id={id}
      className={cn(
        'font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-brand-charcoal',
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
};

export const H2 = ({ children, className, id, ...props }: TypographyProps) => {
  return (
    <h2
      id={id}
      className={cn(
        'font-serif text-2xl md:text-3xl font-medium tracking-tight text-brand-charcoal',
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
};

export const H3 = ({ children, className, id, ...props }: TypographyProps) => {
  return (
    <h3
      id={id}
      className={cn(
        'font-serif text-xl md:text-2xl font-medium tracking-tight text-brand-charcoal',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

export const Subtitle = ({ children, className, id, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      id={id}
      className={cn(
        'font-sans text-base md:text-lg text-brand-charcoal-muted leading-relaxed font-light',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

export const Body = ({ children, className, id, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      id={id}
      className={cn(
        'font-sans text-sm md:text-base text-brand-charcoal-muted leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

export const Code = ({ children, className, id, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <code
      id={id}
      className={cn(
        'font-mono text-xs bg-brand-beige text-brand-accent px-1.5 py-0.5 rounded border border-brand-stone-soft',
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
};
