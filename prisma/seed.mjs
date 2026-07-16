// Données de démonstration. Lancer avec : npx prisma db seed
// (ou : node prisma/seed.mjs). Reproduit fidèlement la logique de vente.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Remise à zéro (ordre respectant les clés étrangères).
  await prisma.vente.deleteMany();
  await prisma.evenementSante.deleteMany();
  await prisma.mouvementComptable.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.categorie.deleteMany();

  const mere = await prisma.animal.create({
    data: {
      numero: "001",
      espece: "mouton",
      sexe: "F",
      race: "Solognote",
      dateNaissance: new Date("2021-03-10"),
      origine: "achat",
      dateEntree: new Date("2021-09-01"),
      coutAchat: 120,
      couleur: "Brun",
    },
  });

  const pere = await prisma.animal.create({
    data: {
      numero: "002",
      espece: "mouton",
      sexe: "M",
      race: "Solognote",
      dateNaissance: new Date("2020-02-15"),
      origine: "achat",
      coutAchat: 180,
    },
  });

  const agneau = await prisma.animal.create({
    data: {
      numero: "010",
      espece: "mouton",
      sexe: "M",
      race: "Solognote",
      dateNaissance: new Date("2024-04-02"),
      origine: "naissance",
      mereId: mere.id,
      pereId: pere.id,
    },
  });

  const chevre = await prisma.animal.create({
    data: {
      numero: "100",
      espece: "chevre",
      sexe: "F",
      race: "Alpine",
      dateNaissance: new Date("2022-05-20"),
      origine: "achat",
      coutAchat: 90,
    },
  });

  await prisma.evenementSante.createMany({
    data: [
      { animalId: mere.id, type: "vaccin", date: new Date("2025-03-01"), note: "Rappel annuel" },
      { animalId: agneau.id, type: "vermifuge", date: new Date("2025-05-15"), note: null },
    ],
  });

  // Une dépense d'alimentation.
  await prisma.mouvementComptable.create({
    data: {
      typeFlux: "depense",
      categorie: "Alimentation / fourrage",
      montant: 250,
      date: new Date("2025-01-20"),
      note: "Foin hiver",
    },
  });

  // Vente de l'agneau — même logique atomique que vendreAnimal().
  await prisma.$transaction(async (tx) => {
    const prix = 220;
    const poids = 38;
    const animal = agneau;
    const mouvement = await tx.mouvementComptable.create({
      data: {
        typeFlux: "gain",
        categorie: "Vente d'animal",
        montant: prix,
        date: new Date("2025-06-10"),
        note: `Vente de l'animal n°${animal.numero}`,
      },
    });
    await tx.vente.create({
      data: {
        animalId: animal.id,
        date: new Date("2025-06-10"),
        prix,
        acheteur: "Boucherie Martin",
        poids,
        prixAuKilo: prix / poids,
        motif: "boucherie",
        marge: prix - (animal.coutAchat ?? 0),
        mouvementId: mouvement.id,
      },
    });
    await tx.animal.update({
      where: { id: animal.id },
      data: { statut: "vendu" },
    });
  });

  const compteurs = {
    present: await prisma.animal.count({ where: { statut: "present" } }),
    vendu: await prisma.animal.count({ where: { statut: "vendu" } }),
    total: await prisma.animal.count(),
  };
  const gains = await prisma.mouvementComptable.aggregate({
    _sum: { montant: true },
    where: { typeFlux: "gain" },
  });
  const depenses = await prisma.mouvementComptable.aggregate({
    _sum: { montant: true },
    where: { typeFlux: "depense" },
  });

  console.log("Seed terminé :", compteurs);
  console.log(
    `Compta 2025 → gains ${gains._sum.montant ?? 0} € / dépenses ${depenses._sum.montant ?? 0} €`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
