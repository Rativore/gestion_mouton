import { type NextRequest } from "next/server";
import { listerMouvements, listerAnnees } from "@/lib/services/comptabilite";
import { TOUTES_ANNEES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth";

/** Échappe un champ CSV (séparateur « ; », convention FR/Excel). */
function champCsv(v: string): string {
  return /[";\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/**
 * Export CSV des mouvements comptables de la période sélectionnée
 * (?annee=YYYY ou ?annee=<toutes>). Séparateur « ; » + BOM UTF-8 pour un
 * affichage correct des accents dans Excel.
 */
export async function GET(request: NextRequest) {
  await requireUser();

  const anneeParam = request.nextUrl.searchParams.get("annee");
  const toutes = anneeParam === TOUTES_ANNEES;
  const annees = await listerAnnees();
  const annee = toutes ? null : Number(anneeParam) || annees[0];
  const mouvements = await listerMouvements(toutes ? {} : { annee: annee! });

  const enTete = ["Date", "Type", "Catégorie", "Montant", "Note"];
  const lignes = mouvements.map((m) => [
    formatDate(m.date),
    m.typeFlux === "gain" ? "Gain" : "Dépense",
    m.categorie,
    String(m.montant).replace(".", ","), // décimale à la française
    m.note ?? "",
  ]);

  const contenu = [enTete, ...lignes]
    .map((ligne) => ligne.map(champCsv).join(";"))
    .join("\r\n");
  const csv = "﻿" + contenu; // BOM UTF-8

  const periode = toutes ? "toutes-annees" : String(annee);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="comptabilite-${periode}.csv"`,
    },
  });
}
