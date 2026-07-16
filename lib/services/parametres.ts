import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { DEVISE_DEFAUT, DEVISES } from "@/lib/constants";

const CLE_DEVISE = "devise";

/** Devise courante (mémorisée le temps d'un rendu). */
export const getDevise = cache(async (): Promise<string> => {
  const p = await prisma.parametre.findUnique({ where: { cle: CLE_DEVISE } });
  return p?.valeur ?? DEVISE_DEFAUT;
});

export async function setDevise(code: string): Promise<void> {
  // N'accepte qu'une devise connue.
  if (!DEVISES.some((d) => d.code === code)) return;
  await prisma.parametre.upsert({
    where: { cle: CLE_DEVISE },
    create: { cle: CLE_DEVISE, valeur: code },
    update: { valeur: code },
  });
}
