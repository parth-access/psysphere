/**
 * Sends a file to a one-time storage ticket, the same request the Supabase client makes.
 * This uses XMLHttpRequest because fetch can't report how much of an upload has gone.
 */
export function sendToStorage({ bucket, path, token, file, type, onPercent }: { bucket: string; path: string; token: string; file: Blob; type: string; onPercent: (percent: number) => void }) {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/upload/sign/${bucket}/${encoded}?token=${encodeURIComponent(token)}`);
    xhr.setRequestHeader("apikey", key);
    xhr.setRequestHeader("authorization", `Bearer ${key}`);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("cache-control", "max-age=3600");
    xhr.setRequestHeader("content-type", type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onPercent(Math.floor((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Storage replied ${xhr.status}`)));
    xhr.onerror = () => reject(new Error("connection"));
    xhr.send(file);
  });
}
