import { prisma } from "@/lib/prisma";
import { CATEGORIE_VENTE_ANIMAL } from "@/lib/constants";

export type DonneesVente = {
  animalId: string;
  date: Date;
  prix: number;
  acheteur: string | null;
  poids: number | null;
  motif: string | null;
};

/** Historique complet des ventes, la plus récente d'abord. */
export async function listerVentes() {
  const rows = await prisma.vente.findMany({
    orderBy: { date: "desc" },
    include: { animal: true },
  });
  return rows.map((v) => ({
    ...v,
    prix: v.prix.toNumber(),
    poids: v.poids?.toNumber() ?? null,
    prixAuKilo: v.prixAuKilo?.toNumber() ?? null,
    marge: v.marge?.toNumber() ?? null,
  }));
}

export async function totalVentes() {
  const agg = await prisma.vente.aggregate({
    _sum: { prix: true, marge: true },
    _count: true,
  });
  return {
    nombre: agg._count,
    montant: agg._sum.prix ?? 0,
    marge: agg._sum.marge ?? 0,
  };
}

/**
 * Vend un animal : opération atomique qui
 *  1. crée le mouvement comptable (gain),
 *  2. crée la fiche de vente (avec marge et prix au kilo),
 *  3. fait passer l'animal au statut "vendu".
 */
export async function vendreAnimal(d: DonneesVente) {
  return prisma.$transaction(async (tx) => {
    const animal = await tx.animal.findUnique({ where: { id: d.animalId } });
    if (!animal) throw new Error("Animal introuvable.");
    if (animal.statut !== "present") {
      throw new Error("Cet animal n'est plus dans le troupeau.");
    }

    const prixAuKilo = d.poids && d.poids > 0 ? d.prix / d.poids : null;
    const marge = d.prix - Number(animal.coutAchat ?? 0);

    const mouvement = await tx.mouvementComptable.create({
      data: {
        typeFlux: "gain",
        categorie: CATEGORIE_VENTE_ANIMAL,
        montant: d.prix,
        date: d.date,
        note: `Vente de l'animal n°${animal.numero}`,
      },
    });

    await tx.vente.create({
      data: {
        animalId: d.animalId,
        date: d.date,
        prix: d.prix,
        acheteur: d.acheteur,
        poids: d.poids,
        prixAuKilo,
        motif: d.motif,
        marge,
        mouvementId: mouvement.id,
      },
    });

    await tx.animal.update({
      where: { id: d.animalId },
      data: { statut: "vendu" },
    });
  });
}

/** Annule une vente : supprime la fiche + le gain et remet l'animal présent. */
export async function annulerVente(venteId: string) {
  return prisma.$transaction(async (tx) => {
    const vente = await tx.vente.findUnique({ where: { id: venteId } });
    if (!vente) return;
    await tx.vente.delete({ where: { id: venteId } });
    if (vente.mouvementId) {
      await tx.mouvementComptable.delete({ where: { id: vente.mouvementId } });
    }
    await tx.animal.update({
      where: { id: vente.animalId },
      data: { statut: "present" },
    });
  });
}
