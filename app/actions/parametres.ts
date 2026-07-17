"use server";

import { revalidatePath } from "next/cache";
import { setDevise } from "@/lib/services/parametres";
import { texteOptionnel } from "@/lib/utils";
import { requireUser } from "@/lib/auth";

export async function setDeviseAction(formData: FormData) {
  await requireUser();
  const devise = texteOptionnel(formData.get("devise"));
  if (devise) await setDevise(devise);
  // Rafraîchit toute l'appli (les montants sont partout).
  revalidatePath("/", "layout");
}
