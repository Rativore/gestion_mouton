"use server";

import { revalidatePath } from "next/cache";
import { vendreAnimal, annulerVente } from "@/lib/services/ventes";
import { texteOptionnel, dateOptionnelle, nombreOptionnel } from "@/lib/utils";

export type EtatFormulaire = { error?: string };

export async function vendreAnimalAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const animalId = texteOptionnel(formData.get("animalId"));
  const prix = nombreOptionnel(formData.get("prix"));
  const date = dateOptionnelle(formData.get("date"));

  if (!animalId) return { error: "Sélectionnez un animal." };
  if (prix == null || prix <= 0) {
    return { error: "Le prix de vente doit être un nombre positif." };
  }
  if (!date) return { error: "La date de vente est obligatoire." };

  try {
    await vendreAnimal({
      animalId,
      prix,
      date,
      acheteur: texteOptionnel(formData.get("acheteur")),
      poids: nombreOptionnel(formData.get("poids")),
      motif: texteOptionnel(formData.get("motif")),
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/ventes");
  revalidatePath("/troupeau");
  revalidatePath("/comptabilite");
  return {};
}

export async function annulerVenteAction(venteId: string) {
  await annulerVente(venteId);
  revalidatePath("/ventes");
  revalidatePath("/troupeau");
  revalidatePath("/comptabilite");
}
