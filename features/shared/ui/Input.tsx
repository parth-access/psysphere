import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col space-y-1">
        {label && (
          <label className="text-xs font-sans font-medium text-brand-charcoal/80">
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            'flex h-9 w-full rounded-xs border border-brand-stone-soft bg-white px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-charcoal-muted/40 focus-visible:outline-none focus-visible:border-brand-accent focus-visible:ring-1 focus-visible:ring-brand-accent/35 disabled:cursor-not-allowed disabled:opacity-50 text-brand-charcoal',
            error && 'border-red-500 focus-visible:ring-red-500/35 focus-visible:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-[11px] text-red-500 font-sans">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col space-y-1">
        {label && (
          <label className="text-xs font-sans font-medium text-brand-charcoal/80">
            {label}
          </label>
        )}
        <textarea
          id={id}
          className={cn(
            'flex min-h-[80px] w-full rounded-xs border border-brand-stone-soft bg-white px-3 py-2 text-sm transition-colors placeholder:text-brand-charcoal-muted/40 focus-visible:outline-none focus-visible:border-brand-accent focus-visible:ring-1 focus-visible:ring-brand-accent/35 disabled:cursor-not-allowed disabled:opacity-50 text-brand-charcoal resize-none',
            error && 'border-red-500 focus-visible:ring-red-500/35 focus-visible:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-[11px] text-red-500 font-sans">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col space-y-1">
        {label && (
          <label className="text-xs font-sans font-medium text-brand-charcoal/80">
            {label}
          </label>
        )}
        <select
          id={id}
          className={cn(
            'flex h-9 w-full rounded-xs border border-brand-stone-soft bg-white px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:border-brand-accent focus-visible:ring-1 focus-visible:ring-brand-accent/35 disabled:cursor-not-allowed disabled:opacity-50 text-brand-charcoal cursor-pointer',
            error && 'border-red-500 focus-visible:ring-red-500/35 focus-visible:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-[11px] text-red-500 font-sans">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
