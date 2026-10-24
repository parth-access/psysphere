import { ReactNode } from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';

const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-sans text-[15px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-forest-800 text-paper shadow-[inset_0_1px_0_rgb(255_255_255/0.15)] hover:bg-forest-900',
  accent: 'bg-gold-500 text-ink-900 shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] hover:bg-gold-400',
  secondary: 'border border-line bg-surface text-ink-900 hover:border-ink-300',
  outline: 'border-[1.5px] border-ink-900/80 text-ink-900 hover:bg-ink-900 hover:text-paper',
  ghost: 'text-ink-700 hover:bg-ink-100',
};

export function Button({
  children,
  variant = 'primary',
  className = '',
  onClick,
  href,
  target,
  rel,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} target={target} rel={rel} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
