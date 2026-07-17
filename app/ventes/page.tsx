import Link from "next/link";
import { listerMouvements } from "@/lib/services/comptabilite";
import { listerAnimauxPresents } from "@/lib/services/animaux";
import { listerEspeces } from "@/lib/services/especes";
import { listerCategories } from "@/lib/services/categories";
import { annulerVenteAction } from "@/app/actions/ventes";
import { supprimerMouvementAction } from "@/app/actions/comptabilite";
import { PageHeader, Card, StatCard } from "@/components/ui";
import { SaisieForm } from "@/components/saisie-form";
import { ConfirmButton } from "@/components/confirm-button";
import { CATEGORIE_VENTE_ANIMAL, CATEGORIE_ACHAT_ANIMAL } from "@/lib/constants";
import { getDevise } from "@/lib/services/parametres";
import { creerFmt, formatDate } from "@/lib/utils";

type Tri = "date" | "type" | "montant";

export default async function AchatVentePage({
  searchParams,
}: {
  searchParams: Promise<{ animal?: string; tri?: string; ordre?: string }>;
}) {
  const sp = await searchParams;
  const [mouvements, animaux, especes, categoriesGain, categoriesDepense, devise] =
    await Promise.all([
      listerMouvements({}),
      listerAnimauxPresents(),
      listerEspeces(),
      listerCategories("gain"),
      listerCategories("depense"),
      getDevise(),
    ]);
  const fmt = creerFmt(devise);

  const totalAchats = mouvements
    .filter((m) => m.typeFlux === "depense")
    .reduce((s, m) => s + m.montant, 0);
  const totalVentes = mouvements
    .filter((m) => m.typeFlux === "gain")
    .reduce((s, m) => s + m.montant, 0);

  // Tri de l'historique (par date décroissante par défaut).
  const tri: Tri =
    sp.tri === "type" || sp.tri === "montant" ? sp.tri : "date";
  const ordre = sp.ordre === "asc" ? "asc" : "desc";
  const sens = ordre === "asc" ? 1 : -1;
  const listeTriee = [...mouvements].sort((a, b) => {
    if (tri === "montant") return (a.montant - b.montant) * sens;
    if (tri === "type") return a.typeFlux.localeCompare(b.typeFlux) * sens;
    return (
      (new Date(a.date).getTime() - new Date(b.date).getTime()) * sens
    );
  });

  const hrefTri = (col: Tri) => {
    const p = new URLSearchParams();
    p.set("tri", col);
    p.set("ordre", tri === col && ordre === "desc" ? "asc" : "desc");
    return `/ventes?${p.toString()}`;
  };
  const fleche = (col: Tri) =>
    tri === col ? (ordre === "asc" ? " ↑" : " ↓") : "";
  const triLabels: { k: Tri; l: string }[] = [
    { k: "date", l: "Date" },
    { k: "type", l: "Type" },
    { k: "montant", l: "Montant" },
  ];

  return (
    <>
      <PageHeader
        titre="Achat / Vente"
        sousTitre="Point de saisie unique — achats en rouge, ventes en vert"
      />

      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="Achats" valeur={fmt(totalAchats)} accent="depense" />
        <StatCard label="Ventes" valeur={fmt(totalVentes)} accent="gain" />
        <StatCard
          label="Solde"
          valeur={fmt(totalVentes - totalAchats)}
          accent={totalVentes - totalAchats >= 0 ? "gain" : "depense"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Historique</h2>
            {mouvements.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>Trier :</span>
                {triLabels.map(({ k, l }) => (
                  <Link
                    key={k}
                    href={hrefTri(k)}
                    className={
                      tri === k
                        ? "font-semibold text-foreground"
                        : "hover:text-foreground"
                    }
                  >
                    {l}
                    {fleche(k)}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {listeTriee.length === 0 ? (
            <p className="text-sm text-muted">Aucune opération enregistrée.</p>
          ) : (
            <div className="divide-y divide-border">
              {listeTriee.map((m) => {
                const estAchat = m.typeFlux === "depense";
                const libelle = m.vente
                  ? `Vente n°${m.vente.animal.numero}`
                  : m.animalAchat
                    ? `Achat n°${m.animalAchat.numero}`
                    : m.categorie;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-medium">
                        <span
                          className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                            estAchat ? "bg-depense" : "bg-gain"
                          }`}
                        />
                        {libelle}
                        {m.note && (
                          <span className="font-normal text-muted">
                            · {m.note}
                          </span>
                        )}
                      </p>
                      <p className="pl-4 text-xs text-muted">
                        {formatDate(m.date)} ·{" "}
                        {estAchat ? "Achat" : "Vente"} · {m.categorie}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`font-semibold ${
                          estAchat ? "text-depense" : "text-gain"
                        }`}
                      >
                        {estAchat ? "−" : "+"}
                        {fmt(m.montant)}
                      </span>
                      {m.vente ? (
                        <ConfirmButton
                          variant="neutral"
                          confirmation={`Annuler la vente de l'animal n°${m.vente.animal.numero} ? Il reviendra dans le troupeau.`}
                          action={annulerVenteAction.bind(null, m.vente.id)}
                        >
                          Annuler
                        </ConfirmButton>
                      ) : m.animalAchat ? (
                        <Link
                          href={`/troupeau/${m.animalAchat.id}`}
                          className="rounded-lg px-2 py-1 text-xs text-muted hover:bg-border/50"
                          title="Achat lié à un animal : modifiez la fiche pour l'ajuster."
                        >
                          Voir 🔒
                        </Link>
                      ) : (
                        <ConfirmButton
                          variant="neutral"
                          confirmation="Supprimer cette opération ?"
                          action={supprimerMouvementAction.bind(null, m.id)}
                        >
                          ✕
                        </ConfirmButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <h2 className="mb-4 font-semibold">Nouvelle opération</h2>
            <SaisieForm
              animaux={animaux}
              especes={especes}
              categoriesAchat={categoriesDepense.filter(
                (c) => c !== CATEGORIE_ACHAT_ANIMAL,
              )}
              categoriesVente={categoriesGain.filter(
                (c) => c !== CATEGORIE_VENTE_ANIMAL,
              )}
              initialAnimalId={sp.animal}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
