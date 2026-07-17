import { compterAnimaux } from "@/lib/services/animaux";
import { bilanAnnuel } from "@/lib/services/comptabilite";
import { listerVentes } from "@/lib/services/ventes";
import { getDevise } from "@/lib/services/parametres";
import { StatCard, Card, LinkButton } from "@/components/ui";
import { creerFmt, formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccueilPage() {
  const annee = new Date().getFullYear();
  const [compteurs, bilan, ventes, devise] = await Promise.all([
    compterAnimaux(),
    bilanAnnuel(annee),
    listerVentes(),
    getDevise(),
  ]);
  const dernieresVentes = ventes.slice(0, 5);
  const fmt = creerFmt(devise);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bonjour 👋</h1>
        <p className="mt-1 text-sm text-muted">
          Vue d&apos;ensemble de votre troupeau et de votre comptabilité {annee}.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Troupeau" valeur={String(compteurs.present)} />
        <StatCard label="Gains" valeur={fmt(bilan.gains)} accent="gain" />
        <StatCard
          label="Dépenses"
          valeur={fmt(bilan.depenses)}
          accent="depense"
        />
        <StatCard
          label="Solde"
          valeur={fmt(bilan.solde)}
          accent={bilan.solde >= 0 ? "gain" : "depense"}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <LinkButton href="/troupeau/nouveau">+ Naissance</LinkButton>
        <LinkButton href="/ventes" variant="neutral">
          Achat / Vente
        </LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Troupeau</h2>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between">
              <span className="text-muted">Présents</span>
              <span className="font-medium">{compteurs.present}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted">Vendus</span>
              <span className="font-medium">{compteurs.vendu}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted">Morts</span>
              <span className="font-medium">{compteurs.mort}</span>
            </li>
            <li className="flex justify-between border-t border-border pt-1">
              <span className="text-muted">Total historique</span>
              <span className="font-medium">{compteurs.total}</span>
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Dernières ventes</h2>
          {dernieresVentes.length === 0 ? (
            <p className="text-sm text-muted">Aucune vente pour le moment.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {dernieresVentes.map((v) => (
                <li key={v.id} className="flex justify-between py-1.5">
                  <Link
                    href={`/troupeau/${v.animalId}`}
                    className="text-primary hover:underline"
                  >
                    n°{v.animal.numero}
                  </Link>
                  <span className="text-muted">{formatDate(v.date)}</span>
                  <span className="font-medium text-gain">
                    {fmt(v.prix)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
