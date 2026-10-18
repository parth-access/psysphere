import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import Link from "next/link";

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function ActionCard({ icon, title, onClick, href, className }: ActionCardProps) {
  const content = (
    <>
      <div className="w-11 h-11 rounded-xl bg-ink-100 flex items-center justify-center text-ink-900">
        {icon}
      </div>
      <span className="text-sm font-medium text-ink-900">{title}</span>
    </>
  );

  const cardClasses = cn(
    "flex flex-col items-start justify-between gap-4 p-5 min-h-28 bg-surface rounded-2xl border border-line hover:border-ink-300 transition-colors w-full text-left cursor-pointer",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cardClasses}>
      {content}
    </button>
  );
}
