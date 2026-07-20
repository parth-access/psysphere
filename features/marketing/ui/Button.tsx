import { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export function Button({
  children,
  variant = 'primary',
  className = '',
  onClick,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
}) {
  const baseStyles = "inline-flex items-center justify-center font-sans font-medium transition-all duration-200 rounded-2xl px-6 py-3.5";
  
  const variants = {
    primary: "bg-brand-primary text-white hover:bg-brand-primary-hover shadow-[0_4px_14px_0_rgba(109,91,208,0.2)] hover:shadow-[0_6px_20px_rgba(109,91,208,0.25)] hover:-translate-y-0.5",
    secondary: "bg-white text-brand-text hover:bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-brand-border hover:-translate-y-0.5",
    outline: "bg-transparent text-brand-text border-2 border-brand-primary hover:bg-brand-primary/5",
    ghost: "bg-transparent text-brand-text-muted hover:text-brand-text hover:bg-brand-surface",
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
