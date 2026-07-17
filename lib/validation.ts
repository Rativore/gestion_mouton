import { z } from "zod";

/** État renvoyé par les Server Actions de formulaire (pour `useActionState`). */
export type EtatFormulaire = { error?: string };

/**
 * Helpers de validation des Server Actions (Zod).
 * Les valeurs d'un FormData sont des chaînes ; ces schémas gèrent la
 * conversion et le « champ vide = non renseigné ».
 */

/** "" ou absent → undefined (champ non renseigné). */
const vide = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : (v ?? undefined);

/** Texte requis (non vide), nettoyé. */
export const texteRequis = (msg: string) =>
  z.preprocess(vide, z.string({ error: msg }).trim().min(1, msg));

/** Texte optionnel (→ undefined si vide). */
export const texteOptionnel = z.preprocess(
  vide,
  z.string().trim().optional(),
);

/** Nombre strictement positif requis. */
export const nombrePositif = (msg: string) =>
  z.preprocess(vide, z.coerce.number({ error: msg }).gt(0, msg));

/** Nombre optionnel (aucune contrainte de signe). */
export const nombreOptionnel = z.preprocess(
  vide,
  z.coerce.number().optional(),
);

/** Date requise (input HTML "YYYY-MM-DD"). */
export const dateRequise = (msg: string) =>
  z.preprocess(vide, z.coerce.date({ error: msg }));

/** Date optionnelle (→ undefined si vide). */
export const dateOptionnelle = z.preprocess(
  vide,
  z.coerce.date().optional(),
);

/**
 * Valide un FormData contre un schéma. Renvoie `{ data }` typé, ou
 * `{ error }` avec le premier message d'erreur (les clés non déclarées,
 * comme le fichier photo, sont simplement ignorées).
 */
export function valider<T extends z.ZodType>(
  schema: T,
  formData: FormData,
): { data: z.infer<T> } | { error: string } {
  const brut = Object.fromEntries(formData.entries());
  const res = schema.safeParse(brut);
  if (!res.success) {
    return { error: res.error.issues[0]?.message ?? "Données invalides." };
  }
  return { data: res.data };
}
