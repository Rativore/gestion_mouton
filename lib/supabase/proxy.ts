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

  // getClaims() vérifie le JWT — localement (via les clés asymétriques + WebCrypto)
  // quand c'est possible, sinon repli automatique sur getUser(). Contrairement à
  // getUser() (un aller-retour réseau à CHAQUE requête), la vérification locale
  // évite un appel Supabase par navigation → pages nettement plus réactives.
  // getClaims s'appuie sur getSession(), qui rafraîchit le jeton expiré et
  // persiste les nouveaux cookies via setAll ci-dessus (session préservée).
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  return { response, user };
}
