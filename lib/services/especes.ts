import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ESPECES } from "@/lib/constants";

export type Espece = { value: string; label: string };

/**
 * Espèces disponibles : celles par défaut d'abord, dans leur ordre de
 * définition (Mouton puis Chèvre), puis les personnalisées par ordre alpha.
 */
export const listerEspeces = cache(async (): Promise<Espece[]> => {
  const defauts = new Set<string>(ESPECES.map((e) => e.value));
  const custom = await prisma.espece.findMany();
  const personnalisees = custom
    .filter((e) => !defauts.has(e.value))
    .map((e) => ({ value: e.value, label: e.label }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));
  return [
    ...ESPECES.map((e) => ({ value: e.value, label: e.label })),
    ...personnalisees,
  ];
});

/** Libellé d'une espèce à partir d'une liste déjà chargée. */
export function libelleEspece(especes: Espece[], value: string): string {
  return especes.find((e) => e.value === value)?.label ?? value;
}

function slug(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function ajouterEspece(label: string): Promise<void> {
  const propre = label.trim();
  const value = slug(propre);
  if (!value) return;
  // Ne pas dupliquer une espèce par défaut.
  if (ESPECES.some((e) => e.value === value)) return;
  await prisma.espece.upsert({
    where: { value },
    create: { value, label: propre },
    update: { label: propre },
  });
}

/** Nombre d'animaux (tous statuts) par espèce, pour savoir si une espèce est utilisée. */
export async function usageEspeces(): Promise<Record<string, number>> {
  const groupes = await prisma.animal.groupBy({ by: ["espece"], _count: true });
  const r: Record<string, number> = {};
  for (const g of groupes) r[g.espece] = g._count;
  return r;
}

export async function supprimerEspece(value: string): Promise<void> {
  if (ESPECES.some((e) => e.value === value)) return; // défaut : non supprimable
  const utilises = await prisma.animal.count({ where: { espece: value } });
  if (utilises > 0) {
    throw new Error(
      "Impossible : des animaux utilisent encore cette espèce.",
    );
  }
  await prisma.espece.delete({ where: { value } }).catch(() => {});
}
