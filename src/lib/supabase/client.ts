import { createBrowserClient } from "@supabase/ssr";

function looksLikeSupabaseSecretKey(key: string): boolean {
  // Supabase keys are JWTs. The service_role key must never be used in the browser.
  const parts = key.split(".");
  if (parts.length !== 3) return false;
  try {
    const payloadJson = Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
      "utf8",
    );
    const payload = JSON.parse(payloadJson) as { role?: string };
    return payload.role === "service_role" || payload.role === "supabase_admin";
  } catch {
    return false;
  }
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  if (looksLikeSupabaseSecretKey(supabaseAnonKey)) {
    throw new Error(
      [
        "Forbidden use of secret Supabase API key in browser.",
        "You likely set NEXT_PUBLIC_SUPABASE_ANON_KEY to the service_role key.",
        "Fix: set NEXT_PUBLIC_SUPABASE_ANON_KEY to the 'anon public' key (Settings → API), and keep the service_role key in SUPABASE_SERVICE_ROLE_KEY (server-only).",
      ].join(" "),
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
