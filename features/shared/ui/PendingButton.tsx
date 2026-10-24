"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A plain submit button that keeps its own styling but locks and shows a spinner
 * while its form is submitting. Use inside any <form action={…}>, including server components.
 * `iconOnly` swaps the content for the spinner, for small icon buttons.
 */
export function PendingButton({
  className,
  children,
  disabled,
  iconOnly,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { iconOnly?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      {...props}
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      className={cn("inline-flex items-center justify-center gap-2 aria-busy:cursor-wait aria-busy:opacity-80", className)}
    >
      {pending && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />}
      {!(pending && iconOnly) && children}
    </button>
  );
}
