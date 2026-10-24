import { cn } from "@/lib/utils";

export function initials(name?: string | null) {
  return (name || "?").trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

/**
 * A person's photo, or their initials on gold when they haven't added one.
 * `photo` is the stored path; its file name goes in the link so a new photo isn't hidden by the cache.
 */
export function Avatar({
  id,
  photo,
  name,
  size = 36,
  className,
}: {
  id: string;
  photo: string | null | undefined;
  name: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const box = cn("shrink-0 rounded-full", className);
  if (photo) {
    const v = encodeURIComponent(photo.split("/").pop() ?? "");
    return (
      // eslint-disable-next-line @next/next/no-img-element -- a private, per-user redirect; next/image can't optimise it
      <img src={`/api/avatars/${id}?v=${v}`} alt="" width={size} height={size} style={{ width: size, height: size }} className={cn(box, "bg-paper-deep object-cover")} />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.36)) }}
      className={cn(box, "flex items-center justify-center bg-gold-500 font-bold text-ink-900")}
    >
      {initials(name)}
    </span>
  );
}
