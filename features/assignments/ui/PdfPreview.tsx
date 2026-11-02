"use client";

import { useState } from "react";

/** Only asks for the PDF once it's opened: a page listing many answers would otherwise download them all on every visit. */
export function PdfPreview({ href, title }: { href: string; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details className="hidden lg:block" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="cursor-pointer text-sm font-semibold text-ink-700">Read it here</summary>
      {open && <iframe src={href} title={title} className="mt-3 h-[75vh] w-full rounded-lg border border-line bg-white" />}
    </details>
  );
}
