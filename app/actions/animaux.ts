"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  creerAnimal,
  modifierAnimal,
  majAnimal,
  supprimerAnimal,
  numeroExiste,
  ajouterEvenementSante,
  supprimerEvenementSante,
  type DonneesAnimal,
} from "@/lib/services/animaux";
import { enregistrerPhoto } from "@/lib/upload";
import {
  texteOptionnel,
  dateOptionnelle,
  nombreOptionnel,
} from "@/lib/utils";
import { PERE_EXTERIEUR } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { z } from "zod";
import {
  valider,
  texteRequis,
  texteOptionnel as zTexteOptionnel,
  dateRequise,
  type EtatFormulaire,
} from "@/lib/validation";

// Champs requis à l'enregistrement d'un animal (les optionnels restent lus via
// les helpers `lib/utils` car DonneesAnimal attend `null`, pas `undefined`).
const schemaAnimalBase = z.object({
  numero: texteRequis("Le numéro est obligatoire."),
  espece: texteRequis("L'espèce est obligatoire."),
});

const schemaSante = z.object({
  animalId: texteRequis("Animal manquant."),
  type: texteRequis("Type et date sont obligatoires."),
  date: dateRequise("Type et date sont obligatoires."),
  note: zTexteOptionnel,
});

export async function enregistrerAnimalAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await requireUser();
  const champs = valider(schemaAnimalBase, formData);
  if ("error" in champs) return { error: champs.error };
  const { numero, espece } = champs.data;
  const id = texteOptionnel(formData.get("id"));

  if (await numeroExiste(numero, id ?? undefined)) {
    return { error: `Le numéro « ${numero} » est déjà utilisé.` };
  }

  let photoUrl: string | null;
  try {
    photoUrl = await enregistrerPhoto(formData.get("photo"));
  } catch (e) {
    return { error: (e as Error).message };
  }

  const mereId = texteOptionnel(formData.get("mereId"));
  const pereIdRaw = texteOptionnel(formData.get("pereId"));
  const estPereExterieur = pereIdRaw === PERE_EXTERIEUR;
  const pereId = estPereExterieur ? null : pereIdRaw;
  const pereExterieur = estPereExterieur
    ? texteOptionnel(formData.get("pereExterieur"))
    : null;

  const origine = texteOptionnel(formData.get("origine")) ?? "naissance";
  const dateEntree = dateOptionnelle(formData.get("dateEntree"));
  const coutAchat =
    origine === "achat" ? nombreOptionnel(formData.get("coutAchat")) : null;

  // Un achat doit porter sa date d'acquisition : sans elle, le mouvement
  // comptable se retrouverait daté du jour (mois en cours) au lieu de la
  // date réelle de l'achat.
  if (origine === "achat" && coutAchat != null && coutAchat > 0 && !dateEntree) {
    return { error: "La date d'entrée est obligatoire pour un achat." };
  }

  // Une bête née n'a ni coût d'achat ni père/mère extérieurs à saisir ici ;
  // une bête achetée n'a pas de filiation locale.
  const donnees: DonneesAnimal = {
    numero,
    espece,
    race: texteOptionnel(formData.get("race")),
    sexe: texteOptionnel(formData.get("sexe")),
    dateNaissance: dateOptionnelle(formData.get("dateNaissance")),
    couleur: texteOptionnel(formData.get("couleur")),
    signes: texteOptionnel(formData.get("signes")),
    note: texteOptionnel(formData.get("note")),
    origine,
    dateEntree,
    coutAchat,
    photoUrl,
    mereId,
    pereId,
    pereExterieur,
  };

  try {
    if (id) {
      await modifierAnimal(id, donnees);
    } else {
      await creerAnimal(donnees);
    }
  } catch {
    return { error: "Erreur lors de l'enregistrement de l'animal." };
  }

  revalidatePath("/troupeau");
  if (id) {
    revalidatePath(`/troupeau/${id}`);
    redirect(`/troupeau/${id}`);
  }
  redirect("/troupeau");
}

export async function supprimerAnimalAction(id: string) {
  await requireUser();
  await supprimerAnimal(id);
  revalidatePath("/troupeau");
  redirect("/troupeau");
}

export async function marquerMortAction(id: string) {
  await requireUser();
  await majAnimal(id, { statut: "mort" });
  revalidatePath("/troupeau");
  revalidatePath(`/troupeau/${id}`);
}

export async function ajouterEvenementSanteAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await requireUser();
  const v = valider(schemaSante, formData);
  if ("error" in v) return { error: v.error };
  const { animalId, type, date, note } = v.data;
  await ajouterEvenementSante({
    animalId,
    type,
    date,
    note: note ?? null,
  });
  revalidatePath(`/troupeau/${animalId}`);
  return {};
}

export async function supprimerEvenementSanteAction(
  id: string,
  animalId: string,
) {
  await requireUser();
  await supprimerEvenementSante(id);
  revalidatePath(`/troupeau/${animalId}`);
}
