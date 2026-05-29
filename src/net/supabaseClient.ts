import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Lazily-created singleton Supabase client. Only constructed when a battle
// using the Supabase backend actually starts (this module is dynamically
// imported), so the SDK stays out of the initial bundle. The anon key is
// public by design and safe to ship in the browser.

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL as string;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    client = createClient(url, anonKey, {
      realtime: { params: { eventsPerSecond: 20 } },
      auth: { persistSession: false },
    });
  }
  return client;
}
