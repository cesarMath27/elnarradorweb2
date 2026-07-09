import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

// Cliente anónimo para lecturas públicas (news, magazines, categories).
// A diferencia de `server.ts`, NO usa cookies() de next/headers: leer cookies
// marca la ruta como dinámica y anula el render estático/ISR, obligando a
// re-renderizar cada página en cada request (CPU alto en Cloudflare Workers).
// Las lecturas públicas son anónimas, así que no necesitan sesión.
let client: SupabaseClient | null = null;

export function createPublicClient(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  }
  return client;
}
