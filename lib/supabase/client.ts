import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  return url;
}

function getSecretKey(): string {
  return (
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    ""
  );
}

function getPublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  );
}

let serverClient: SupabaseClient | null = null;

export function createServerClient(): SupabaseClient {
  if (serverClient) return serverClient;
  const key = getSecretKey();
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY)"
    );
  }
  serverClient = createClient(getSupabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serverClient;
}

export function createBrowserClient(): SupabaseClient | null {
  const key = getPublishableKey();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !key) return null;
  return createClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (getSecretKey() || getPublishableKey())
  );
}
