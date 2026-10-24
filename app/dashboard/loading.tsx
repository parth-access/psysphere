/** Shown in the content area the moment a dashboard link is clicked, while the next page loads on the server. */
export default function DashboardLoading() {
  const block = "rounded-2xl bg-paper-deep motion-safe:animate-pulse";
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading…</span>
      <div className="space-y-3">
        <div className={`${block} h-9 w-64 max-w-full`} />
        <div className={`${block} h-4 w-96 max-w-full`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={`${block} h-24`} />
        <div className={`${block} h-24`} />
        <div className={`${block} h-24`} />
      </div>
      <div className={`${block} h-64`} />
    </div>
  );
}
