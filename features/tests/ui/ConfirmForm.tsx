"use client";

/** A form that asks before submitting, for actions that can't be undone. */
export function ConfirmForm({
  action,
  message,
  children,
}: {
  action: (fd: FormData) => Promise<void>;
  message: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
