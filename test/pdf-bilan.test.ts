import { test } from "node:test";
import assert from "node:assert/strict";
import { pdfSafe, construireBilanPdf } from "@/lib/pdf-bilan";

test("pdfSafe : espaces insécables/fines → espace normale (montant préservé)", () => {
  // Ce que produit Intl.NumberFormat fr-FR : U+202F (milliers) + U+00A0 (avant €).
  assert.equal(pdfSafe("1 234,56 €"), "1 234,56 €");
});

test("pdfSafe : retire les caractères non encodables (émojis), garde les accents", () => {
  assert.equal(pdfSafe("Mouton 🐑 n°12"), "Mouton  n°12");
  assert.equal(pdfSafe("éàçùœ « ok » — fin…"), "éàçùœ « ok » — fin…");
});

test("pdfSafe : normalise les retours à la ligne et trim", () => {
  assert.equal(pdfSafe("  a\nb\tc  "), "a b c");
});

test("construireBilanPdf : produit un PDF valide (multi-pages)", async () => {
  const bilan = {
    gains: 1000,
    depenses: 400,
    solde: 600,
    parCategorie: [
      { typeFlux: "gain", categorie: "Vente d'animal", total: 1000 },
      { typeFlux: "depense", categorie: "Vétérinaire", total: 400 },
    ],
  };
  const mouvements = Array.from({ length: 60 }, (_, i) => ({
    date: new Date(2026, i % 12, (i % 27) + 1),
    typeFlux: i % 2 === 0 ? "gain" : "depense",
    categorie: i % 2 === 0 ? "Vente d'animal" : "Vétérinaire",
    montant: 10 + i,
    note: i % 4 === 0 ? "Note 🐑 accentuée éà" : null,
  }));

  const octets = await construireBilanPdf(bilan, mouvements, "EUR", "2026");
  assert.ok(octets.length > 1000);
  // En-tête de fichier PDF.
  const magic = Buffer.from(octets.slice(0, 5)).toString("latin1");
  assert.equal(magic, "%PDF-");
});
