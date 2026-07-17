import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rafraîchit la session Supabase à chaque requête (rotation des tokens) et
 * renvoie l'utilisateur courant. Appelé depuis `proxy.ts`.
 *
 * La `response` renvoyée porte les cookies mis à jour : elle DOIT être
 * retournée telle quelle par le proxy pour que la session reste valide.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() valide le token auprès de Supabase (à préférer à getSession
  // côté serveur, qui ne vérifie pas la signature).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
