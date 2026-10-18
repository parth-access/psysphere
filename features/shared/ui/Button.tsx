'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, id, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-sans font-medium transition-all focus:outline-none focus:ring-1 focus:ring-brand-charcoal/20 disabled:opacity-50 disabled:pointer-events-none rounded-xl cursor-pointer border';
    
    const variants = {
      primary: 'bg-brand-accent text-brand-cream hover:bg-brand-accent-hover active:bg-brand-accent/90 border-brand-accent shadow-2xs',
      secondary: 'bg-brand-beige text-brand-charcoal hover:bg-brand-stone-soft border-brand-stone-soft/60',
      outline: 'bg-transparent border-brand-stone-soft hover:bg-brand-cream/80 text-brand-charcoal',
      ghost: 'bg-transparent border-transparent hover:bg-brand-cream text-brand-charcoal',
      link: 'bg-transparent border-transparent text-brand-accent hover:underline p-0 underline-offset-4',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
    };

    const buttonClass = cn(baseStyles, variants[variant], sizes[size], className);

    return (
      <motion.button
        id={id}
        ref={ref}
        disabled={disabled || isLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={buttonClass}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
