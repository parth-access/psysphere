"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="min-h-10 rounded-full bg-forest-800 px-4 text-sm font-semibold text-paper hover:bg-forest-900">
      Print or save as PDF
    </button>
  );
}
