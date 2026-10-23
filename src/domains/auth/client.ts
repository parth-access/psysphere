import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClientOptions } from "@supabase/supabase-js";

type BrowserClientOptions = { isSingleton?: boolean; auth?: SupabaseClientOptions<"public">["auth"] };

export function createClient(options?: BrowserClientOptions) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !url.startsWith("http") || !key) {
    // Prevent Next.js static prerendering crash when env variables are not present during build
    return createBrowserClient(
      "https://placeholder-project.supabase.co",
      "placeholder-anon-key",
      options
    );
  }

  return createBrowserClient(url, key, options);
}
