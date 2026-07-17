"use server";

import { revalidatePath } from "next/cache";
import { creerAnimal, numeroExiste } from "@/lib/services/animaux";
import { vendreAnimal } from "@/lib/services/ventes";
import { creerMouvement } from "@/lib/services/comptabilite";
import { ajouterCategorie, type TypeFlux } from "@/lib/services/categories";
import { enregistrerPhoto } from "@/lib/upload";
import { texteOptionnel, dateOptionnelle, nombreOptionnel } from "@/lib/utils";
import { SOUS_TYPE_ANIMAL_PREFIX, SOUS_TYPE_AUTRE } from "@/lib/constants";
import { requireUser } from "@/lib/auth";

export type EtatFormulaire = { error?: string };

/**
 * Saisie unique et centralisée « Achat / Vente ».
 *  - flux = "achat" (dépense) | "vente" (gain)
 *  - sousType « animal » → crée / vend une bête (formulaire détaillé)
 *  - sinon → simple mouvement comptable (catégorie libre ou existante)
 */
export async function enregistrerSaisieAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await requireUser();
  const flux = texteOptionnel(formData.get("flux"));
  const sousType = texteOptionnel(formData.get("sousType"));
  const date = dateOptionnelle(formData.get("date"));
  const montant = nombreOptionnel(formData.get("montant"));

  if (flux !== "achat" && flux !== "vente") {
    return { error: "Type d'opération invalide." };
  }
  if (!date) return { error: "La date est obligatoire." };
  if (montant == null || montant <= 0) {
    return { error: "Le montant doit être un nombre positif." };
  }

  const estAnimal = !!sousType && sousType.startsWith(SOUS_TYPE_ANIMAL_PREFIX);
  const espece = estAnimal
    ? sousType!.slice(SOUS_TYPE_ANIMAL_PREFIX.length)
    : "";

  // --- Achat d'un animal : crée la bête (+ dépense d'achat liée) ---
  if (flux === "achat" && estAnimal) {
    const numero = texteOptionnel(formData.get("numero"));
    if (!numero) return { error: "Le numéro de l'animal est obligatoire." };
    if (await numeroExiste(numero)) {
      return { error: `Le numéro « ${numero} » est déjà utilisé.` };
    }
    let photoUrl: string | null;
    try {
      photoUrl = await enregistrerPhoto(formData.get("photo"));
    } catch (e) {
      return { error: (e as Error).message };
    }
    try {
      await creerAnimal({
        numero,
        espece,
        race: texteOptionnel(formData.get("race")),
        sexe: texteOptionnel(formData.get("sexe")),
        dateNaissance: dateOptionnelle(formData.get("dateNaissance")),
        couleur: texteOptionnel(formData.get("couleur")),
        signes: texteOptionnel(formData.get("signes")),
        note: texteOptionnel(formData.get("note")),
        origine: "achat",
        dateEntree: date,
        coutAchat: montant,
        photoUrl,
        mereId: null,
        pereId: null,
        pereExterieur: null,
      });
    } catch {
      return { error: "Erreur lors de l'enregistrement de l'achat." };
    }
    revalidatePath("/ventes");
    revalidatePath("/troupeau");
    revalidatePath("/comptabilite");
    return {};
  }

  // --- Vente d'un animal ---
  if (flux === "vente" && estAnimal) {
    const animalId = texteOptionnel(formData.get("animalId"));
    if (!animalId) return { error: "Sélectionnez un animal à vendre." };
    try {
      await vendreAnimal({
        animalId,
        prix: montant,
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

  // --- Dépense (achat) ou gain (vente) simple, non lié à un animal ---
  const typeFlux: TypeFlux = flux === "achat" ? "depense" : "gain";
  const categorie =
    sousType === SOUS_TYPE_AUTRE
      ? texteOptionnel(formData.get("categorieLibre"))
      : sousType;
  if (!categorie) return { error: "La catégorie est obligatoire." };
  if (sousType === SOUS_TYPE_AUTRE) {
    await ajouterCategorie(categorie, typeFlux);
  }

  await creerMouvement({
    typeFlux,
    categorie,
    montant,
    date,
    note: texteOptionnel(formData.get("note")),
  });
  revalidatePath("/comptabilite");
  revalidatePath("/ventes");
  return {};
}
