import * as React from 'react';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon = <HelpCircle className="h-8 w-8 text-brand-accent/40" />,
  title,
  description,
  actionText,
  onAction,
  className,
  id,
  ...props
}: EmptyStateProps) => {
  return (
    <div
      id={id}
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-brand-stone-soft/80 rounded-lg bg-brand-cream/35',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-beige/50 text-brand-accent mb-4">
        {icon}
      </div>
      <h3 className="font-serif text-base font-medium text-brand-charcoal mb-1.5">
        {title}
      </h3>
      <p className="font-sans text-xs text-brand-charcoal-muted max-w-sm leading-relaxed mb-5">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
