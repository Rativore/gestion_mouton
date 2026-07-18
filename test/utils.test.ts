import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatMontant,
  calculerAge,
  nombreOptionnel,
  toDateInput,
  lienTri,
  flecheTri,
} from "@/lib/utils";

// Retire les espaces (fines/insécables incluses) pour comparer sans dépendre
// du formatage exact d'Intl.
const sansEspaces = (s: string) => s.replace(/\s/g, "");

test("formatMontant : devise, séparateurs et null", () => {
  assert.equal(sansEspaces(formatMontant(1234.5, "EUR")), "1234,50€");
  assert.equal(sansEspaces(formatMontant(0, "EUR")), "0,00€");
  assert.equal(formatMontant(null), "—");
  assert.equal(formatMontant(undefined), "—");
  // Devise par défaut = EUR.
  assert.equal(sansEspaces(formatMontant(10)), "10,00€");
});

test("calculerAge : ans/mois, cas limites", () => {
  const ref = new Date(2026, 6, 18); // 18 juillet 2026
  assert.equal(calculerAge(new Date(2024, 3, 18), ref), "2 ans et 3 mois");
  assert.equal(calculerAge(new Date(2024, 6, 18), ref), "2 ans");
  assert.equal(calculerAge(new Date(2026, 3, 18), ref), "3 mois");
  assert.equal(calculerAge(new Date(2026, 5, 30), ref), "0 mois"); // < 1 mois
  assert.equal(calculerAge(null, ref), "—");
  assert.equal(calculerAge(new Date(2027, 0, 1), ref), "—"); // futur
  assert.equal(calculerAge(new Date(2025, 6, 18), ref), "1 an"); // singulier
});

test("nombreOptionnel : virgule, vide, invalide", () => {
  assert.equal(nombreOptionnel("1,5"), 1.5);
  assert.equal(nombreOptionnel("1.5"), 1.5);
  assert.equal(nombreOptionnel("42"), 42);
  assert.equal(nombreOptionnel(""), null);
  assert.equal(nombreOptionnel(null), null);
  assert.equal(nombreOptionnel("abc"), null);
});

test("toDateInput : format YYYY-MM-DD zéro-paddé", () => {
  assert.equal(toDateInput(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(toDateInput(new Date(2026, 11, 31)), "2026-12-31");
  assert.equal(toDateInput(null), "");
});

test("lienTri : bascule le sens, conserve les params", () => {
  // Colonne non active → ordre par défaut.
  assert.equal(
    lienTri("/troupeau", { espece: "mouton" }, "numero", "date", "asc"),
    "/troupeau?espece=mouton&tri=numero&ordre=asc",
  );
  // Colonne active asc → passe desc.
  assert.equal(
    lienTri("/troupeau", {}, "numero", "numero", "asc"),
    "/troupeau?tri=numero&ordre=desc",
  );
  // Colonne active desc → repasse asc.
  assert.equal(
    lienTri("/troupeau", {}, "numero", "numero", "desc"),
    "/troupeau?tri=numero&ordre=asc",
  );
});

test("flecheTri : flèche selon colonne/ordre", () => {
  assert.equal(flecheTri("numero", "numero", "asc"), " ↑");
  assert.equal(flecheTri("numero", "numero", "desc"), " ↓");
  assert.equal(flecheTri("numero", "date", "asc"), "");
});
