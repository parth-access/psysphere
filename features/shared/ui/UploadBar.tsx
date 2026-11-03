/** Shows how far an upload has got. Without a percent the bar keeps moving, for steps that can't report how far along they are. */
export function UploadBar({ label, percent }: { label?: string; percent?: number | null }) {
  const known = typeof percent === "number";
  return (
    <div className="space-y-1.5">
      {label && (
        <p className="flex items-center justify-between gap-3 text-[13px] font-medium text-ink-700">
          <span>{label}</span>
          {known && <span className="tabular-nums">{percent}%</span>}
        </p>
      )}
      <div role="progressbar" aria-label={label ?? "Upload progress"} aria-valuenow={known ? percent : undefined} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-paper-deep">
        {known ? (
          <div className="h-full rounded-full bg-forest-800 transition-[width] duration-200" style={{ width: `${percent}%` }} />
        ) : (
          <div className="h-full w-1/3 rounded-full bg-forest-800 animate-[upload-slide_1.2s_ease-in-out_infinite]" />
        )}
      </div>
    </div>
  );
}
