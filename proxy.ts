import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Protège toutes les routes de l'app : sans session valide, redirige vers
// /login. (Next 16 : ce fichier remplace l'ancien `middleware.ts`.)
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const estLogin = pathname === "/login";

  // Non connecté → tout renvoie vers la page de connexion.
  if (!user && !estLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Déjà connecté et sur /login → retour à l'accueil.
  if (user && estLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Important : renvoyer la réponse portant les cookies de session rafraîchis.
  return response;
}

export const config = {
  // S'applique à tout, SAUF les assets statiques et les fichiers d'icônes /
  // manifest / service worker (doivent rester publics, notamment pour /login).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|sw.js).*)",
  ],
};
