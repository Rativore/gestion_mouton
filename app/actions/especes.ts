"use server";

import { revalidatePath } from "next/cache";
import { ajouterEspece, supprimerEspece } from "@/lib/services/especes";
import { texteOptionnel } from "@/lib/utils";

export type EtatFormulaire = { error?: string };

export async function ajouterEspeceAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const nom = texteOptionnel(formData.get("nom"));
  if (!nom) return { error: "Le nom est obligatoire." };
  await ajouterEspece(nom);
  // Les espèces changent les onglets et la saisie partout.
  revalidatePath("/", "layout");
  return {};
}

export async function supprimerEspeceAction(value: string) {
  await supprimerEspece(value);
  revalidatePath("/", "layout");
}
