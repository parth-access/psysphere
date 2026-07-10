import * as React from 'react';
import { cn } from '@/lib/utils';
import { H1, H3, Subtitle, Body } from './Typography';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, description, actions, className, id, ...props }: PageHeaderProps) => {
  return (
    <div
      id={id}
      className={cn(
        'flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-brand-stone-soft/50 mb-8',
        className
      )}
      {...props}
    >
      <div className="space-y-1.5 max-w-2xl">
        <H1 className="text-2xl md:text-3xl font-medium tracking-tight text-brand-charcoal">{title}</H1>
        {description && <Subtitle className="text-sm font-light text-brand-charcoal-muted">{description}</Subtitle>}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const SectionHeader = ({ title, description, actions, className, id, ...props }: SectionHeaderProps) => {
  return (
    <div
      id={id}
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-brand-stone-soft/30 mb-6',
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <H3 className="text-lg md:text-xl font-medium text-brand-charcoal">{title}</H3>
        {description && <Body className="text-xs text-brand-charcoal-muted">{description}</Body>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
