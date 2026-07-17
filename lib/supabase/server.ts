import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase lié aux cookies de la requête (auth côté serveur).
 * À utiliser dans les Server Components, Server Actions et Route Handlers.
 * Utilise la clé publishable (publique) — la session vit dans les cookies.
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Appelé depuis un Server Component (cookies en lecture seule) :
            // sans effet, le proxy se charge de rafraîchir la session.
          }
        },
      },
    },
  );
}
