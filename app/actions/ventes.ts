"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { vendreAnimal, annulerVente } from "@/lib/services/ventes";
import { requireUser } from "@/lib/auth";
import {
  valider,
  texteRequis,
  texteOptionnel,
  nombrePositif,
  nombreOptionnel,
  dateRequise,
  type EtatFormulaire,
} from "@/lib/validation";

const schemaVente = z.object({
  animalId: texteRequis("Sélectionnez un animal."),
  prix: nombrePositif("Le prix de vente doit être un nombre positif."),
  date: dateRequise("La date de vente est obligatoire."),
  acheteur: texteOptionnel,
  poids: nombreOptionnel,
  motif: texteOptionnel,
});

export async function vendreAnimalAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await requireUser();
  const v = valider(schemaVente, formData);
  if ("error" in v) return { error: v.error };
  const { animalId, prix, date, acheteur, poids, motif } = v.data;

  try {
    await vendreAnimal({
      animalId,
      prix,
      date,
      acheteur: acheteur ?? null,
      poids: poids ?? null,
      motif: motif ?? null,
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
  await requireUser();
  await annulerVente(venteId);
  revalidatePath("/ventes");
  revalidatePath("/troupeau");
  revalidatePath("/comptabilite");
}
