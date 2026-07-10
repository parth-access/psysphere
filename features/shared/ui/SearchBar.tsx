import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearchChange?: (val: string) => void;
  shortcut?: string;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, onSearchChange, shortcut = '⌘K', id, ...props }, ref) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onSearchChange) {
        onSearchChange(e.target.value);
      }
    };

    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-brand-charcoal-muted/40" />
        </div>
        <input
          id={id}
          ref={ref}
          type="text"
          onChange={handleInputChange}
          className={cn(
            'block w-full pl-9 pr-12 py-1.5 text-sm h-9 bg-white border border-brand-stone-soft rounded-xs focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/35 transition-all text-brand-charcoal placeholder:text-brand-charcoal-muted/40 font-sans',
            className
          )}
          {...props}
        />
        {shortcut && (
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded-xs border border-brand-stone-soft bg-brand-cream/85 px-1.5 font-mono text-[10px] font-medium text-brand-charcoal-muted/60">
              {shortcut}
            </kbd>
          </div>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
