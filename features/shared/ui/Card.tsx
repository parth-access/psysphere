import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className, id, ...props }: CardProps) => {
  return (
    <div
      id={id}
      className={cn(
        'bg-white border border-brand-stone-soft rounded-xs shadow-[0_2px_4px_rgba(0,0,0,0.01)] transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, id, ...props }: CardProps) => {
  return (
    <div
      id={id}
      className={cn('flex flex-col space-y-1.5 p-6 border-b border-brand-stone-soft/40', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      id={id}
      className={cn('font-serif text-lg font-medium tracking-tight text-brand-charcoal', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className, id, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      id={id}
      className={cn('font-sans text-xs text-brand-charcoal-muted font-light leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent = ({ children, className, id, ...props }: CardProps) => {
  return (
    <div id={id} className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className, id, ...props }: CardProps) => {
  return (
    <div
      id={id}
      className={cn('flex items-center p-6 pt-0 border-t border-brand-stone-soft/30 mt-4 justify-end gap-3', className)}
      {...props}
    >
      {children}
    </div>
  );
};
