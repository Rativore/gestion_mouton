"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export type EtatConnexion = { error?: string };

/** Connexion par email / mot de passe (Supabase Auth). */
export async function connexionAction(
  _prev: EtatConnexion,
  formData: FormData,
): Promise<EtatConnexion> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Identifiants incorrects." };
  }

  // redirect() lève une exception de contrôle de flux : hors du try/catch.
  redirect("/");
}

/** Déconnexion. */
export async function deconnexionAction() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
