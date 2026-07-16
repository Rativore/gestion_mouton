import {
  bilanAnnuel,
  bilanGlobal,
  listerAnnees,
  listerMouvements,
} from "@/lib/services/comptabilite";
import { supprimerMouvementAction } from "@/app/actions/comptabilite";
import {
  PageHeader,
  Card,
  StatCard,
  Badge,
  LinkButton,
} from "@/components/ui";
import { BilanChart, type PointGraphe } from "@/components/bilan-chart";
import { AnneeSelect } from "@/components/annee-select";
import { ConfirmButton } from "@/components/confirm-button";
import { TOUTES_ANNEES } from "@/lib/constants";
import { getDevise } from "@/lib/services/parametres";
import { formatMontant, formatDate, MOIS_COURTS } from "@/lib/utils";

export default async function ComptabilitePage({
  searchParams,
}: {
  searchParams: Promise<{ annee?: string }>;
}) {
  const sp = await searchParams;
  const annees = await listerAnnees();
  const toutes = sp.annee === TOUTES_ANNEES;
  const annee = toutes ? null : Number(sp.annee) || annees[0];

  const [bilan, mouvements, devise] = await Promise.all([
    toutes ? bilanGlobal() : bilanAnnuel(annee!),
    listerMouvements(toutes ? {} : { annee: annee! }),
    getDevise(),
  ]);
  const fmt = (n: number | null | undefined) => formatMontant(n, devise);

  // Points du graphe : par année en mode global, par mois pour une année.
  const points: PointGraphe[] = toutes
    ? "parAnnee" in bilan
      ? bilan.parAnnee.map((a) => ({
          label: String(a.annee),
          gains: a.gains,
          depenses: a.depenses,
        }))
      : []
    : "parMois" in bilan
      ? bilan.parMois.map((m) => ({
          label: MOIS_COURTS[m.mois - 1],
          gains: m.gains,
          depenses: m.depenses,
        }))
      : [];

  const libellePeriode = toutes ? "toutes les années" : String(annee);

  return (
    <>
      <PageHeader
        titre="Comptabilité"
        sousTitre="Suivi des gains et dépenses, à l'année et mois par mois"
        action={
          <AnneeSelect annees={annees} valeur={toutes ? TOUTES_ANNEES : annee!} />
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
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

        <Card>
          <h2 className="mb-4 font-semibold">
            {toutes ? "Évolution par année" : `Évolution mensuelle ${annee}`}
          </h2>
          <BilanChart points={points} />
        </Card>

        {bilan.parCategorie.length > 0 && (
          <Card>
            <h2 className="mb-3 font-semibold">Par catégorie</h2>
            <div className="space-y-1">
              {bilan.parCategorie.map((c) => (
                <div
                  key={`${c.typeFlux}-${c.categorie}`}
                  className="flex items-center justify-between border-b border-border py-1.5 text-sm last:border-0"
                >
                  <span className="flex items-center gap-2">
                    <Badge tone={c.typeFlux as "gain" | "depense"}>
                      {c.typeFlux === "gain" ? "Gain" : "Dépense"}
                    </Badge>
                    {c.categorie}
                  </span>
                  <span
                    className={
                      c.typeFlux === "gain" ? "text-gain" : "text-depense"
                    }
                  >
                    {fmt(c.total)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Mouvements {libellePeriode}</h2>
            <LinkButton href="/ventes" variant="neutral">
              + Saisir
            </LinkButton>
          </div>
          {mouvements.length === 0 ? (
            <p className="text-sm text-muted">
              Aucun mouvement enregistré pour cette période. Ajoutez-en depuis
              «&nbsp;Gains / Dépenses&nbsp;».
            </p>
          ) : (
            <div className="divide-y divide-border">
              {mouvements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {m.categorie}
                      {m.note && (
                        <span className="ml-2 font-normal text-muted">
                          · {m.note}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted">{formatDate(m.date)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`font-semibold ${
                        m.typeFlux === "gain" ? "text-gain" : "text-depense"
                      }`}
                    >
                      {m.typeFlux === "gain" ? "+" : "−"}
                      {fmt(m.montant)}
                    </span>
                    {m.vente || m.animalAchat ? (
                      <span
                        className="text-xs text-muted"
                        title={
                          m.vente
                            ? "Gain issu d'une vente : annulez la vente pour le retirer."
                            : "Dépense d'achat d'un animal : modifiez ou supprimez l'animal pour l'ajuster."
                        }
                      >
                        🔒
                      </span>
                    ) : (
                      <ConfirmButton
                        variant="neutral"
                        confirmation="Supprimer ce mouvement ?"
                        action={supprimerMouvementAction.bind(null, m.id)}
                      >
                        ✕
                      </ConfirmButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
