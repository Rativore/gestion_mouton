import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * Garantit qu'une session valide existe, sinon redirige vers /login.
 * À appeler au début de chaque Server Action : le proxy protège déjà les
 * navigations, mais les Server Actions sont des POST — cette vérification est
 * une défense en profondeur au cas où la couverture du proxy changerait.
 */
export async function requireUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}
