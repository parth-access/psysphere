'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export interface FilterOption {
  value: string;
  label: string;
}

interface FiltersProps {
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
}

export const Filters = ({ options, selectedValue, onChange, className, id }: FiltersProps) => {
  return (
    <div
      id={id}
      className={cn(
        'flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none border-b border-brand-stone-soft/30',
        className
      )}
    >
      {options.map((option) => {
        const isActive = selectedValue === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative px-3 py-1.5 text-xs font-medium font-sans transition-colors rounded-xl cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-brand-accent/20',
              isActive
                ? 'text-brand-accent'
                : 'text-brand-charcoal-muted hover:text-brand-charcoal hover:bg-brand-beige/40'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilterBg"
                className="absolute inset-0 bg-brand-cream border border-brand-stone-soft/60 rounded-xl -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
