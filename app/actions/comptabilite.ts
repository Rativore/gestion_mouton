"use server";

import { revalidatePath } from "next/cache";
import { supprimerMouvement } from "@/lib/services/comptabilite";
import { requireUser } from "@/lib/auth";

export async function supprimerMouvementAction(
  id: string,
): Promise<{ error?: string }> {
  await requireUser();
  try {
    await supprimerMouvement(id);
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/comptabilite");
  return {};
}
