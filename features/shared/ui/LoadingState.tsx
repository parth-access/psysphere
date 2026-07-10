import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: 'spinner' | 'skeleton' | 'full';
  rows?: number;
}

export const LoadingState = ({ mode = 'skeleton', rows = 3, className, id, ...props }: LoadingProps) => {
  if (mode === 'full') {
    return (
      <div
        id={id}
        className={cn('flex flex-col items-center justify-center min-h-[300px] gap-3 text-brand-charcoal-muted', className)}
        {...props}
      >
        <Loader className="h-6 w-6 animate-spin text-brand-accent/70" />
        <span className="text-xs font-sans font-light tracking-wide">Syncing PsySphere workspace...</span>
      </div>
    );
  }

  if (mode === 'spinner') {
    return (
      <div
        id={id}
        className={cn('flex items-center justify-center p-6', className)}
        {...props}
      >
        <Loader className="h-5 w-5 animate-spin text-brand-accent/50" />
      </div>
    );
  }

  return (
    <div id={id} className={cn('w-full space-y-4 p-4', className)} {...props}>
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 rounded-full bg-brand-stone-soft/45 animate-pulse shrink-0" />
        <div className="space-y-2 w-full">
          <div className="h-4 w-[250px] rounded bg-brand-stone-soft/45 animate-pulse" />
          <div className="h-3 w-[200px] rounded bg-brand-stone-soft/30 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-9 w-full rounded bg-brand-stone-soft/25 animate-pulse"
            style={{ animationDelay: `${index * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
};
