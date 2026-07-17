"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ajouterEspece, supprimerEspece } from "@/lib/services/especes";
import { requireUser } from "@/lib/auth";
import { valider, texteRequis, type EtatFormulaire } from "@/lib/validation";

const schemaEspece = z.object({ nom: texteRequis("Le nom est obligatoire.") });

export async function ajouterEspeceAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await requireUser();
  const v = valider(schemaEspece, formData);
  if ("error" in v) return { error: v.error };
  await ajouterEspece(v.data.nom);
  // Les espèces changent les onglets et la saisie partout.
  revalidatePath("/", "layout");
  return {};
}

export async function supprimerEspeceAction(value: string) {
  await requireUser();
  await supprimerEspece(value);
  revalidatePath("/", "layout");
}
