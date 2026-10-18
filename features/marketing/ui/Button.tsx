import { ReactNode } from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';

const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 font-sans text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink-900 text-paper hover:bg-ink-700',
  accent: 'bg-marigold-500 text-ink-900 hover:bg-marigold-100',
  secondary: 'border border-line bg-surface text-ink-900 hover:bg-paper-deep',
  outline: 'border border-ink-900 text-ink-900 hover:bg-ink-100',
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
