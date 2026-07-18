import { type NextRequest } from "next/server";
import {
  bilanAnnuel,
  bilanGlobal,
  listerMouvements,
  listerAnnees,
} from "@/lib/services/comptabilite";
import { getDevise } from "@/lib/services/parametres";
import { TOUTES_ANNEES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { construireBilanPdf } from "@/lib/pdf-bilan";

/**
 * Export PDF du bilan comptable de la période sélectionnée
 * (?annee=YYYY ou ?annee=<toutes>) : totaux, répartition par catégorie et
 * journal des mouvements. Généré avec pdf-lib (voir lib/pdf-bilan.ts).
 */
export async function GET(request: NextRequest) {
  await requireUser();

  const anneeParam = request.nextUrl.searchParams.get("annee");
  const toutes = anneeParam === TOUTES_ANNEES;
  const annees = await listerAnnees();
  const annee = toutes ? null : Number(anneeParam) || annees[0];

  const [bilan, mouvements, devise] = await Promise.all([
    toutes ? bilanGlobal() : bilanAnnuel(annee!),
    listerMouvements(toutes ? {} : { annee: annee! }),
    getDevise(),
  ]);

  const libellePeriode = toutes ? "Toutes les années" : String(annee);
  const octets = await construireBilanPdf(bilan, mouvements, devise, libellePeriode);

  const periode = toutes ? "toutes-annees" : String(annee);
  return new Response(octets as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bilan-${periode}.pdf"`,
    },
  });
}
