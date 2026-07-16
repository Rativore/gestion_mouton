"use server";

import { revalidatePath } from "next/cache";
import { creerMouvement, supprimerMouvement } from "@/lib/services/comptabilite";
import { ajouterCategorie, type TypeFlux } from "@/lib/services/categories";
import { texteOptionnel, dateOptionnelle, nombreOptionnel } from "@/lib/utils";

export type EtatFormulaire = { error?: string };

export async function creerMouvementAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const typeFlux = texteOptionnel(formData.get("typeFlux"));
  const montant = nombreOptionnel(formData.get("montant"));
  const date = dateOptionnelle(formData.get("date"));

  // Catégorie : soit choisie dans la liste, soit saisie librement.
  const categorieChoisie = texteOptionnel(formData.get("categorie"));
  const categorieLibre = texteOptionnel(formData.get("categorieLibre"));
  const categorie =
    categorieChoisie === "__autre__" ? categorieLibre : categorieChoisie;

  if (typeFlux !== "gain" && typeFlux !== "depense") {
    return { error: "Type de flux invalide." };
  }
  if (montant == null || montant <= 0) {
    return { error: "Le montant doit être un nombre positif." };
  }
  if (!date) return { error: "La date est obligatoire." };
  if (!categorie) return { error: "La catégorie est obligatoire." };

  // Mémoriser une nouvelle catégorie saisie librement.
  if (categorieChoisie === "__autre__") {
    await ajouterCategorie(categorie, typeFlux as TypeFlux);
  }

  await creerMouvement({
    typeFlux,
    categorie,
    montant,
    date,
    note: texteOptionnel(formData.get("note")),
  });

  revalidatePath("/comptabilite");
  return {};
}

export async function supprimerMouvementAction(
  id: string,
): Promise<{ error?: string }> {
  try {
    await supprimerMouvement(id);
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/comptabilite");
  return {};
}
