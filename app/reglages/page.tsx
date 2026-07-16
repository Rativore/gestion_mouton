import { listerCategories } from "@/lib/services/categories";
import { getDevise } from "@/lib/services/parametres";
import { listerEspeces, usageEspeces } from "@/lib/services/especes";
import { supprimerCategorieAction } from "@/app/actions/categories";
import { setDeviseAction } from "@/app/actions/parametres";
import { supprimerEspeceAction } from "@/app/actions/especes";
import { CATEGORIES_DEFAUT, DEVISES, ESPECES, emojiEspece } from "@/lib/constants";
import { PageHeader, Card, Badge } from "@/components/ui";
import { CategorieForm } from "@/components/categorie-form";
import { EspeceForm } from "@/components/espece-form";
import { ConfirmButton } from "@/components/confirm-button";
import { SubmitButton } from "@/components/submit-button";

export const dynamic = "force-dynamic";

async function BlocEspeces() {
  const [especes, usage] = await Promise.all([listerEspeces(), usageEspeces()]);
  const defauts = new Set<string>(ESPECES.map((e) => e.value));

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-semibold">Espèces d&apos;animaux</h2>
        <p className="text-sm text-muted">
          Types gérés dans le troupeau et la saisie Achat / Vente.
        </p>
      </div>
      <div className="space-y-1">
        {especes.map((e) => {
          const estDefaut = defauts.has(e.value);
          const nb = usage[e.value] ?? 0;
          return (
            <div
              key={e.value}
              className="flex items-center justify-between border-b border-border py-1.5 text-sm last:border-0"
            >
              <span className="flex items-center gap-2">
                {emojiEspece(e.value)} {e.label}
                {estDefaut && <Badge>par défaut</Badge>}
                {nb > 0 && (
                  <span className="text-xs text-muted">
                    · {nb} animal{nb > 1 ? "aux" : ""}
                  </span>
                )}
              </span>
              {!estDefaut && nb === 0 && (
                <ConfirmButton
                  variant="neutral"
                  confirmation={`Supprimer l'espèce « ${e.label} » ?`}
                  action={supprimerEspeceAction.bind(null, e.value)}
                >
                  ✕
                </ConfirmButton>
              )}
            </div>
          );
        })}
      </div>
      <EspeceForm />
    </Card>
  );
}

async function BlocDevise() {
  const devise = await getDevise();
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-semibold">Devise</h2>
        <p className="text-sm text-muted">
          Monnaie utilisée pour tous les montants de l&apos;application.
        </p>
      </div>
      <form action={setDeviseAction} className="flex items-end gap-2">
        <div className="grow">
          <label className="label" htmlFor="devise">
            Devise
          </label>
          <select
            id="devise"
            name="devise"
            defaultValue={devise}
            className="field"
          >
            {DEVISES.map((d) => (
              <option key={d.code} value={d.code}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <SubmitButton variant="neutral">Enregistrer</SubmitButton>
      </form>
    </Card>
  );
}

async function BlocCategories({
  typeFlux,
  titre,
}: {
  typeFlux: "gain" | "depense";
  titre: string;
}) {
  const categories = await listerCategories(typeFlux);
  const defauts = new Set(CATEGORIES_DEFAUT[typeFlux]);

  return (
    <Card className="space-y-4">
      <h2 className="font-semibold">{titre}</h2>
      <div className="space-y-1">
        {categories.map((c) => {
          const estDefaut = defauts.has(c);
          return (
            <div
              key={c}
              className="flex items-center justify-between border-b border-border py-1.5 text-sm last:border-0"
            >
              <span className="flex items-center gap-2">
                {c}
                {estDefaut && <Badge>par défaut</Badge>}
              </span>
              {!estDefaut && (
                <ConfirmButton
                  variant="neutral"
                  confirmation={`Supprimer la catégorie « ${c} » ? Les mouvements existants ne sont pas modifiés.`}
                  action={supprimerCategorieAction.bind(null, c, typeFlux)}
                >
                  ✕
                </ConfirmButton>
              )}
            </div>
          );
        })}
      </div>
      <CategorieForm typeFlux={typeFlux} />
    </Card>
  );
}

export default function ReglagesPage() {
  return (
    <>
      <PageHeader
        titre="Réglages"
        sousTitre="Devise, espèces et catégories de gains / dépenses"
      />
      <div className="space-y-6">
        <BlocDevise />
        <BlocEspeces />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <BlocCategories typeFlux="gain" titre="Catégories de gains" />
          <BlocCategories typeFlux="depense" titre="Catégories de dépenses" />
        </div>
      </div>
    </>
  );
}
