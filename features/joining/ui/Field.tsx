import type { ReactNode } from "react";

export const inputClass =
  "w-full min-h-12 rounded-2xl border border-line bg-surface px-4 text-[16px] text-ink-900 placeholder:text-ink-500/70 focus:outline-none focus:ring-2 focus:ring-forest-800/25 focus:border-forest-800 aria-[invalid=true]:border-rose-600";

export function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-ink-900">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[13px] text-ink-500">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="text-[13px] font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  name,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { name: string; error?: string }) {
  return (
    <input
      id={name}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${name}-error` : undefined}
      className={inputClass}
      {...props}
    />
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 border-0 p-0 m-0">
      <legend className="mb-1 font-serif text-xl text-ink-900">{title}</legend>
      {children}
    </fieldset>
  );
}

export const primaryButtonClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest-800 px-6 font-bold text-paper transition-colors hover:bg-forest-900 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-[1.5px] border-ink-900 px-6 font-bold text-ink-900 transition-colors hover:bg-ink-100";
