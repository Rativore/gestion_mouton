import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type FiltreMouvements = {
  annee?: number;
  mois?: number; // 1-12, optionnel
  typeFlux?: string;
};

function borneAnnee(annee: number, mois?: number) {
  if (mois && mois >= 1 && mois <= 12) {
    return {
      gte: new Date(annee, mois - 1, 1),
      lt: new Date(annee, mois, 1),
    };
  }
  return {
    gte: new Date(annee, 0, 1),
    lt: new Date(annee + 1, 0, 1),
  };
}

export async function listerMouvements(filtre: FiltreMouvements) {
  const where: Prisma.MouvementComptableWhereInput = {};
  if (filtre.annee) where.date = borneAnnee(filtre.annee, filtre.mois);
  if (filtre.typeFlux) where.typeFlux = filtre.typeFlux;
  const rows = await prisma.mouvementComptable.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      vente: { include: { animal: true } },
      animalAchat: true,
    },
  });
  // Decimal → number sur le montant (seul champ monétaire lu en aval).
  return rows.map((m) => ({ ...m, montant: m.montant.toNumber() }));
}

/** Années pour lesquelles il existe au moins un mouvement. */
export async function listerAnnees(): Promise<number[]> {
  const mouvements = await prisma.mouvementComptable.findMany({
    select: { date: true },
  });
  const annees = new Set(mouvements.map((m) => m.date.getFullYear()));
  annees.add(new Date().getFullYear());
  return [...annees].sort((a, b) => b - a);
}

export type BilanMensuel = {
  mois: number;
  gains: number;
  depenses: number;
  solde: number;
};

export type BilanAnnuel = {
  annee: number;
  gains: number;
  depenses: number;
  solde: number;
  parMois: BilanMensuel[];
  parCategorie: { typeFlux: string; categorie: string; total: number }[];
};

/** Une ligne minimale pour l'agrégation (montant encore en Decimal Prisma). */
type LigneAgregat = {
  date: Date;
  typeFlux: string;
  categorie: string;
  montant: { toNumber(): number };
};

/**
 * Parcours unique des mouvements : cumule gains/dépenses et la répartition par
 * catégorie (partie commune à `bilanAnnuel` et `bilanGlobal`), et délègue à
 * `surMontant` le remplissage du seau spécifique (par mois ou par année).
 */
function agreger(
  mouvements: LigneAgregat[],
  surMontant: (date: Date, typeFlux: string, montant: number) => void,
) {
  const categorieMap = new Map<string, number>();
  let gains = 0;
  let depenses = 0;

  for (const m of mouvements) {
    const montant = m.montant.toNumber();
    if (m.typeFlux === "gain") gains += montant;
    else depenses += montant;
    const cle = `${m.typeFlux}::${m.categorie}`;
    categorieMap.set(cle, (categorieMap.get(cle) ?? 0) + montant);
    surMontant(m.date, m.typeFlux, montant);
  }

  const parCategorie = [...categorieMap.entries()]
    .map(([cle, total]) => {
      const [typeFlux, categorie] = cle.split("::");
      return { typeFlux, categorie, total };
    })
    .sort((a, b) => b.total - a.total);

  return { gains, depenses, parCategorie };
}

/** Agrège gains/dépenses d'une année, mois par mois et par catégorie. */
export async function bilanAnnuel(annee: number): Promise<BilanAnnuel> {
  const mouvements = await prisma.mouvementComptable.findMany({
    where: { date: borneAnnee(annee) },
    select: { date: true, typeFlux: true, montant: true, categorie: true },
  });

  const parMois: BilanMensuel[] = Array.from({ length: 12 }, (_, i) => ({
    mois: i + 1,
    gains: 0,
    depenses: 0,
    solde: 0,
  }));

  const { gains, depenses, parCategorie } = agreger(
    mouvements,
    (date, typeFlux, montant) => {
      const idx = date.getMonth();
      if (typeFlux === "gain") parMois[idx].gains += montant;
      else parMois[idx].depenses += montant;
    },
  );

  for (const m of parMois) m.solde = m.gains - m.depenses;

  return {
    annee,
    gains,
    depenses,
    solde: gains - depenses,
    parMois,
    parCategorie,
  };
}

export type BilanAnnee = {
  annee: number;
  gains: number;
  depenses: number;
  solde: number;
};

export type BilanGlobal = {
  gains: number;
  depenses: number;
  solde: number;
  parAnnee: BilanAnnee[];
  parCategorie: { typeFlux: string; categorie: string; total: number }[];
};

/** Agrège gains/dépenses sur toutes les années, année par année et par catégorie. */
export async function bilanGlobal(): Promise<BilanGlobal> {
  const mouvements = await prisma.mouvementComptable.findMany({
    select: { date: true, typeFlux: true, montant: true, categorie: true },
  });

  const anneeMap = new Map<number, BilanAnnee>();

  const { gains, depenses, parCategorie } = agreger(
    mouvements,
    (date, typeFlux, montant) => {
      const an = date.getFullYear();
      let bilan = anneeMap.get(an);
      if (!bilan) {
        bilan = { annee: an, gains: 0, depenses: 0, solde: 0 };
        anneeMap.set(an, bilan);
      }
      if (typeFlux === "gain") bilan.gains += montant;
      else bilan.depenses += montant;
    },
  );

  const parAnnee = [...anneeMap.values()]
    .map((b) => ({ ...b, solde: b.gains - b.depenses }))
    .sort((a, b) => a.annee - b.annee);

  return { gains, depenses, solde: gains - depenses, parAnnee, parCategorie };
}

export async function creerMouvement(data: {
  typeFlux: string;
  categorie: string;
  montant: number;
  date: Date;
  note: string | null;
}) {
  return prisma.mouvementComptable.create({ data });
}

export async function supprimerMouvement(id: string) {
  // Une vente référence son mouvement ; refuser la suppression directe dans ce cas.
  const mouvement = await prisma.mouvementComptable.findUnique({
    where: { id },
    include: { vente: true, animalAchat: true },
  });
  if (!mouvement) return;
  if (mouvement.vente) {
    throw new Error(
      "Ce gain provient d'une vente. Annulez la vente pour le supprimer.",
    );
  }
  if (mouvement.animalAchat) {
    throw new Error(
      "Cette dépense correspond à l'achat d'un animal. Modifiez ou supprimez l'animal pour l'ajuster.",
    );
  }
  await prisma.mouvementComptable.delete({ where: { id } });
}
