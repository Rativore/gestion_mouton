import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculerBilanAnnuel,
  calculerBilanGlobal,
} from "@/lib/services/comptabilite";

/** Construit une ligne de mouvement comme la renvoie Prisma (montant Decimal). */
function mvt(
  date: Date,
  typeFlux: "gain" | "depense",
  categorie: string,
  montant: number,
) {
  return { date, typeFlux, categorie, montant: { toNumber: () => montant } };
}

test("calculerBilanAnnuel : totaux, ventilation mensuelle et solde", () => {
  const mouvements = [
    mvt(new Date(2026, 0, 10), "gain", "Vente d'animal", 100),
    mvt(new Date(2026, 0, 20), "depense", "Alimentation", 40),
    mvt(new Date(2026, 2, 5), "gain", "Vente d'animal", 60),
  ];
  const b = calculerBilanAnnuel(2026, mouvements);

  assert.equal(b.annee, 2026);
  assert.equal(b.gains, 160);
  assert.equal(b.depenses, 40);
  assert.equal(b.solde, 120);

  assert.equal(b.parMois.length, 12);
  // Janvier (index 0).
  assert.deepEqual(b.parMois[0], {
    mois: 1,
    gains: 100,
    depenses: 40,
    solde: 60,
  });
  // Mars (index 2).
  assert.deepEqual(b.parMois[2], { mois: 3, gains: 60, depenses: 0, solde: 60 });
  // Un mois sans mouvement reste à zéro.
  assert.deepEqual(b.parMois[5], { mois: 6, gains: 0, depenses: 0, solde: 0 });
});

test("calculerBilanAnnuel : par catégorie agrégé et trié décroissant", () => {
  const mouvements = [
    mvt(new Date(2026, 0, 1), "gain", "Vente d'animal", 100),
    mvt(new Date(2026, 1, 1), "gain", "Vente d'animal", 50),
    mvt(new Date(2026, 2, 1), "depense", "Vétérinaire", 200),
    mvt(new Date(2026, 3, 1), "gain", "Subvention", 30),
  ];
  const b = calculerBilanAnnuel(2026, mouvements);

  // Trié par total décroissant : Vétérinaire (200) > Vente (150) > Subvention (30).
  assert.deepEqual(b.parCategorie, [
    { typeFlux: "depense", categorie: "Vétérinaire", total: 200 },
    { typeFlux: "gain", categorie: "Vente d'animal", total: 150 },
    { typeFlux: "gain", categorie: "Subvention", total: 30 },
  ]);
});

test("calculerBilanAnnuel : même libellé mais type différent reste distinct", () => {
  const mouvements = [
    mvt(new Date(2026, 0, 1), "gain", "Divers", 40),
    mvt(new Date(2026, 0, 2), "depense", "Divers", 25),
  ];
  const b = calculerBilanAnnuel(2026, mouvements);
  assert.equal(b.parCategorie.length, 2);
  assert.ok(
    b.parCategorie.some(
      (c) => c.typeFlux === "gain" && c.categorie === "Divers" && c.total === 40,
    ),
  );
  assert.ok(
    b.parCategorie.some(
      (c) =>
        c.typeFlux === "depense" && c.categorie === "Divers" && c.total === 25,
    ),
  );
});

test("calculerBilanAnnuel : aucun mouvement → tout à zéro", () => {
  const b = calculerBilanAnnuel(2026, []);
  assert.equal(b.gains, 0);
  assert.equal(b.depenses, 0);
  assert.equal(b.solde, 0);
  assert.equal(b.parCategorie.length, 0);
  assert.ok(b.parMois.every((m) => m.gains === 0 && m.depenses === 0));
});

test("calculerBilanGlobal : ventilation par année triée croissant", () => {
  const mouvements = [
    mvt(new Date(2026, 0, 1), "gain", "Vente d'animal", 100),
    mvt(new Date(2024, 5, 1), "depense", "Alimentation", 40),
    mvt(new Date(2024, 6, 1), "gain", "Vente d'animal", 10),
    mvt(new Date(2026, 3, 1), "depense", "Vétérinaire", 20),
  ];
  const b = calculerBilanGlobal(mouvements);

  assert.equal(b.gains, 110);
  assert.equal(b.depenses, 60);
  assert.equal(b.solde, 50);

  // Trié par année croissante.
  assert.deepEqual(b.parAnnee, [
    { annee: 2024, gains: 10, depenses: 40, solde: -30 },
    { annee: 2026, gains: 100, depenses: 20, solde: 80 },
  ]);
});
