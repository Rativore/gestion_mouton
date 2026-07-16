import { prisma } from "@/lib/prisma";
import { CATEGORIES_DEFAUT } from "@/lib/constants";

export type TypeFlux = "gain" | "depense";

/**
 * Liste des catégories pour un type de flux : catégories par défaut (code)
 * fusionnées avec les catégories personnalisées (base), triées.
 */
export async function listerCategories(typeFlux: TypeFlux): Promise<string[]> {
  const custom = await prisma.categorie.findMany({
    where: { typeFlux },
    select: { nom: true },
  });
  const noms = new Set<string>([
    ...CATEGORIES_DEFAUT[typeFlux],
    ...custom.map((c) => c.nom),
  ]);
  return [...noms].sort((a, b) => a.localeCompare(b, "fr"));
}

export async function ajouterCategorie(
  nom: string,
  typeFlux: TypeFlux,
): Promise<void> {
  const propre = nom.trim();
  if (!propre) return;
  // Ne pas dupliquer une catégorie par défaut.
  if (CATEGORIES_DEFAUT[typeFlux].includes(propre)) return;
  await prisma.categorie.upsert({
    where: { nom_typeFlux: { nom: propre, typeFlux } },
    create: { nom: propre, typeFlux },
    update: {},
  });
}

export async function supprimerCategorie(
  nom: string,
  typeFlux: TypeFlux,
): Promise<void> {
  await prisma.categorie
    .delete({ where: { nom_typeFlux: { nom, typeFlux } } })
    .catch(() => {
      // Catégorie par défaut ou inexistante : rien à faire.
    });
}
