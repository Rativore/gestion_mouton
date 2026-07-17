"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ajouterCategorie,
  supprimerCategorie,
  type TypeFlux,
} from "@/lib/services/categories";
import { requireUser } from "@/lib/auth";
import { valider, texteRequis } from "@/lib/validation";

export type EtatFormulaire = { error?: string };

const schemaCategorie = z.object({
  nom: texteRequis("Le nom est obligatoire."),
  typeFlux: z.enum(["gain", "depense"], { error: "Type de flux invalide." }),
});

export async function ajouterCategorieAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await requireUser();
  const v = valider(schemaCategorie, formData);
  if ("error" in v) return { error: v.error };
  await ajouterCategorie(v.data.nom, v.data.typeFlux);
  revalidatePath("/reglages");
  revalidatePath("/comptabilite");
  return {};
}

export async function supprimerCategorieAction(
  nom: string,
  typeFlux: TypeFlux,
) {
  await requireUser();
  await supprimerCategorie(nom, typeFlux);
  revalidatePath("/reglages");
  revalidatePath("/comptabilite");
}
