"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="min-h-10 rounded-xl bg-ink-900 px-4 text-sm font-semibold text-paper hover:bg-ink-700">
      Print or save as PDF
    </button>
  );
}
