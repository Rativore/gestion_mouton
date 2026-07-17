import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { CATEGORIE_ACHAT_ANIMAL } from "@/lib/constants";

export type FiltreAnimaux = {
  espece?: string;
  statut?: string;
  statuts?: string[];
  recherche?: string;
};

/** Liste des animaux, filtrable, la plus récente d'abord. */
export async function listerAnimaux(filtre: FiltreAnimaux = {}) {
  const where: Prisma.AnimalWhereInput = {};
  if (filtre.espece) where.espece = filtre.espece;
  if (filtre.statut) where.statut = filtre.statut;
  else if (filtre.statuts) where.statut = { in: filtre.statuts };
  if (filtre.recherche) {
    // mode "insensitive" : PostgreSQL est sensible à la casse par défaut.
    where.OR = [
      { numero: { contains: filtre.recherche, mode: "insensitive" } },
      { race: { contains: filtre.recherche, mode: "insensitive" } },
      { note: { contains: filtre.recherche, mode: "insensitive" } },
    ];
  }
  return prisma.animal.findMany({
    where,
    orderBy: [{ statut: "asc" }, { numero: "asc" }],
  });
}

/** Compteurs pour le tableau de bord / onglets (présents groupés par espèce). */
export async function compterAnimaux() {
  const [groupes, vendu, mort, total] = await Promise.all([
    prisma.animal.groupBy({
      by: ["espece"],
      where: { statut: "present" },
      _count: true,
    }),
    prisma.animal.count({ where: { statut: "vendu" } }),
    prisma.animal.count({ where: { statut: "mort" } }),
    prisma.animal.count(),
  ]);
  const parEspece: Record<string, number> = {};
  let present = 0;
  for (const g of groupes) {
    parEspece[g.espece] = g._count;
    present += g._count;
  }
  return { parEspece, present, vendu, mort, sortis: vendu + mort, total };
}

/** Fiche complète d'un animal (filiation, santé, vente). */
export async function getAnimal(id: string) {
  return prisma.animal.findUnique({
    where: { id },
    include: {
      mere: true,
      pere: true,
      enfantsMere: { orderBy: { numero: "asc" } },
      enfantsPere: { orderBy: { numero: "asc" } },
      evenementsSante: { orderBy: { date: "desc" } },
      vente: true,
      mouvementAchat: true,
    },
  });
}

/** Animaux utilisables comme parents (présents), pour les listes déroulantes. */
export async function listerParents(excludeId?: string) {
  return prisma.animal.findMany({
    where: excludeId ? { id: { not: excludeId } } : undefined,
    select: { id: true, numero: true, espece: true, sexe: true },
    orderBy: { numero: "asc" },
  });
}

/** Animaux encore dans le troupeau (pour l'action de vente). */
export async function listerAnimauxPresents() {
  return prisma.animal.findMany({
    where: { statut: "present" },
    select: { id: true, numero: true, espece: true, coutAchat: true },
    orderBy: { numero: "asc" },
  });
}

/** Données d'un animal telles que fournies par le formulaire. */
export type DonneesAnimal = {
  numero: string;
  espece: string;
  race: string | null;
  sexe: string | null;
  dateNaissance: Date | null;
  couleur: string | null;
  signes: string | null;
  note: string | null;
  origine: string;
  dateEntree: Date | null;
  coutAchat: number | null;
  photoUrl?: string | null;
  mereId: string | null;
  pereId: string | null;
  pereExterieur: string | null;
};

function champsScalaires(d: DonneesAnimal) {
  return {
    numero: d.numero,
    espece: d.espece,
    race: d.race,
    sexe: d.sexe,
    dateNaissance: d.dateNaissance,
    couleur: d.couleur,
    signes: d.signes,
    note: d.note,
    origine: d.origine,
    dateEntree: d.dateEntree,
    coutAchat: d.coutAchat,
    pereExterieur: d.pereExterieur,
  };
}

/**
 * Synchronise la dépense d'achat rattachée à un animal : la crée, la met à
 * jour ou la supprime selon que l'animal est (encore) un achat avec un coût.
 */
async function reconcilierAchat(
  tx: Prisma.TransactionClient,
  animal: { id: string; numero: string; mouvementAchatId: string | null },
  d: DonneesAnimal,
) {
  const doitExister =
    d.origine === "achat" && d.coutAchat != null && d.coutAchat > 0;
  const note = `Achat de l'animal n°${d.numero}`;

  if (doitExister && animal.mouvementAchatId) {
    // La date comptable suit la date d'entrée. Si elle n'est pas fournie, on
    // conserve la date existante du mouvement — surtout PAS `new Date()`, qui
    // ferait basculer un achat passé dans le mois en cours.
    const existant = await tx.mouvementComptable.findUnique({
      where: { id: animal.mouvementAchatId },
      select: { date: true },
    });
    const dateAchat = d.dateEntree ?? existant?.date ?? new Date();
    await tx.mouvementComptable.update({
      where: { id: animal.mouvementAchatId },
      data: { montant: d.coutAchat!, date: dateAchat, note },
    });
  } else if (doitExister) {
    const dateAchat = d.dateEntree ?? new Date();
    const mouvement = await tx.mouvementComptable.create({
      data: {
        typeFlux: "depense",
        categorie: CATEGORIE_ACHAT_ANIMAL,
        montant: d.coutAchat!,
        date: dateAchat,
        note,
      },
    });
    await tx.animal.update({
      where: { id: animal.id },
      data: { mouvementAchatId: mouvement.id },
    });
  } else if (animal.mouvementAchatId) {
    const mouvementId = animal.mouvementAchatId;
    await tx.animal.update({
      where: { id: animal.id },
      data: { mouvementAchatId: null },
    });
    await tx.mouvementComptable.delete({ where: { id: mouvementId } });
  }
}

/** Crée un animal ; si c'est un achat avec coût, crée la dépense liée. */
export async function creerAnimal(d: DonneesAnimal) {
  return prisma.$transaction(async (tx) => {
    const animal = await tx.animal.create({
      data: {
        ...champsScalaires(d),
        photoUrl: d.photoUrl ?? null,
        statut: "present",
        mere: d.mereId ? { connect: { id: d.mereId } } : undefined,
        pere: d.pereId ? { connect: { id: d.pereId } } : undefined,
      },
    });
    await reconcilierAchat(tx, { ...animal }, d);
    return animal;
  });
}

/** Modifie un animal et resynchronise sa dépense d'achat. */
export async function modifierAnimal(id: string, d: DonneesAnimal) {
  return prisma.$transaction(async (tx) => {
    const animal = await tx.animal.update({
      where: { id },
      data: {
        ...champsScalaires(d),
        ...(d.photoUrl ? { photoUrl: d.photoUrl } : {}),
        mere: d.mereId ? { connect: { id: d.mereId } } : { disconnect: true },
        pere: d.pereId ? { connect: { id: d.pereId } } : { disconnect: true },
      },
    });
    await reconcilierAchat(tx, { ...animal }, d);
    return animal;
  });
}

/** Met à jour des champs simples (ex : statut) sans toucher à la compta. */
export async function majAnimal(id: string, data: Prisma.AnimalUpdateInput) {
  return prisma.animal.update({ where: { id }, data });
}

/**
 * Supprime un animal et les écritures comptables liées (dépense d'achat et/ou
 * gain de vente). La vente éventuelle est supprimée d'abord : sans cela, la
 * clé étrangère `Vente.animalId` bloquerait la suppression d'un animal vendu.
 */
export async function supprimerAnimal(id: string) {
  return prisma.$transaction(async (tx) => {
    const animal = await tx.animal.findUnique({
      where: { id },
      select: {
        mouvementAchatId: true,
        vente: { select: { id: true, mouvementId: true } },
      },
    });

    // Vente liée → supprimer la vente puis son mouvement de gain.
    if (animal?.vente) {
      await tx.vente.delete({ where: { id: animal.vente.id } });
      if (animal.vente.mouvementId) {
        await tx.mouvementComptable.delete({
          where: { id: animal.vente.mouvementId },
        });
      }
    }

    await tx.animal.delete({ where: { id } });

    if (animal?.mouvementAchatId) {
      await tx.mouvementComptable.delete({
        where: { id: animal.mouvementAchatId },
      });
    }
  });
}

export async function ajouterEvenementSante(data: {
  animalId: string;
  date: Date;
  type: string;
  note: string | null;
}) {
  return prisma.evenementSante.create({ data });
}

export async function supprimerEvenementSante(id: string) {
  return prisma.evenementSante.delete({ where: { id } });
}

export async function numeroExiste(numero: string, excludeId?: string) {
  const found = await prisma.animal.findFirst({
    where: { numero, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  return found != null;
}
