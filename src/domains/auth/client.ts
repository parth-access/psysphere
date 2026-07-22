import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !url.startsWith("http") || !key) {
    // Prevent Next.js static prerendering crash when env variables are not present during build
    return createBrowserClient(
      "https://placeholder-project.supabase.co",
      "placeholder-anon-key"
    );
  }
  
  return createBrowserClient(url, key);
}

