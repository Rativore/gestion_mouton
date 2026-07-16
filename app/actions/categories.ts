"use server";

import { revalidatePath } from "next/cache";
import {
  ajouterCategorie,
  supprimerCategorie,
  type TypeFlux,
} from "@/lib/services/categories";
import { texteOptionnel } from "@/lib/utils";

export type EtatFormulaire = { error?: string };

export async function ajouterCategorieAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const nom = texteOptionnel(formData.get("nom"));
  const typeFlux = texteOptionnel(formData.get("typeFlux"));
  if (!nom) return { error: "Le nom est obligatoire." };
  if (typeFlux !== "gain" && typeFlux !== "depense") {
    return { error: "Type de flux invalide." };
  }
  await ajouterCategorie(nom, typeFlux as TypeFlux);
  revalidatePath("/reglages");
  revalidatePath("/comptabilite");
  return {};
}

export async function supprimerCategorieAction(
  nom: string,
  typeFlux: TypeFlux,
) {
  await supprimerCategorie(nom, typeFlux);
  revalidatePath("/reglages");
  revalidatePath("/comptabilite");
}
