"use server";

import { revalidatePath } from "next/cache";
import { setDevise } from "@/lib/services/parametres";
import { texteOptionnel } from "@/lib/utils";

export async function setDeviseAction(formData: FormData) {
  const devise = texteOptionnel(formData.get("devise"));
  if (devise) await setDevise(devise);
  // Rafraîchit toute l'appli (les montants sont partout).
  revalidatePath("/", "layout");
}
