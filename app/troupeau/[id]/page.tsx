import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimal } from "@/lib/services/animaux";
import {
  supprimerAnimalAction,
  marquerMortAction,
  supprimerEvenementSanteAction,
} from "@/app/actions/animaux";
import { PageHeader, Card, Badge, LinkButton } from "@/components/ui";
import { AnimalPhoto } from "@/components/animal-photo";
import { ConfirmButton } from "@/components/confirm-button";
import { SanteForm } from "@/components/sante-form";
import {
  SEXES,
  STATUTS,
  ORIGINES,
  TYPES_SANTE,
  MOTIFS_VENTE,
  labelDe,
} from "@/lib/constants";
import { listerEspeces, libelleEspece } from "@/lib/services/especes";
import { getDevise } from "@/lib/services/parametres";
import { formatDate, creerFmt, calculerAge } from "@/lib/utils";

function Info({ label, valeur }: { label: string; valeur: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{valeur ?? "—"}</dd>
    </div>
  );
}

export default async function AnimalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [animal, devise, especes] = await Promise.all([
    getAnimal(id),
    getDevise(),
    listerEspeces(),
  ]);
  if (!animal) notFound();
  const fmt = creerFmt(devise);

  const present = animal.statut === "present";
  const enfants = [...animal.enfantsMere, ...animal.enfantsPere];

  return (
    <>
      <PageHeader
        titre={`Animal n°${animal.numero}`}
        sousTitre={`${libelleEspece(especes, animal.espece)}${animal.race ? ` · ${animal.race}` : ""}`}
        action={
          <div className="flex items-center gap-2">
            <LinkButton href={`/troupeau/${animal.id}/modifier`} variant="neutral">
              Modifier
            </LinkButton>
            {present && (
              <LinkButton href={`/ventes?animal=${animal.id}`}>Vendre</LinkButton>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-xl border border-border">
            <AnimalPhoto
              photoUrl={animal.photoUrl}
              espece={animal.espece}
              alt={`Animal n°${animal.numero}`}
            />
          </div>
          <div className="flex items-center justify-between">
            <Badge tone={animal.statut as "present" | "vendu" | "mort"}>
              {labelDe(STATUTS, animal.statut)}
            </Badge>
            <div className="flex gap-1">
              {present && (
                <ConfirmButton
                  variant="neutral"
                  confirmation="Marquer cet animal comme mort ?"
                  action={marquerMortAction.bind(null, animal.id)}
                >
                  Décès
                </ConfirmButton>
              )}
              <ConfirmButton
                confirmation={`Supprimer définitivement l'animal n°${animal.numero} ? Cette action est irréversible.`}
                action={supprimerAnimalAction.bind(null, animal.id)}
              >
                Supprimer
              </ConfirmButton>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 font-semibold">Identité</h2>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Info label="Numéro" valeur={animal.numero} />
              <Info label="Espèce" valeur={libelleEspece(especes, animal.espece)} />
              <Info label="Sexe" valeur={labelDe(SEXES, animal.sexe)} />
              <Info label="Race" valeur={animal.race} />
              <Info label="Couleur" valeur={animal.couleur} />
              <Info
                label="Naissance"
                valeur={formatDate(animal.dateNaissance)}
              />
              <Info label="Âge" valeur={calculerAge(animal.dateNaissance)} />
              <Info label="Signes" valeur={animal.signes} />
            </dl>
            {animal.note && (
              <p className="mt-4 rounded-lg bg-border/30 p-3 text-sm">
                {animal.note}
              </p>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold">Provenance</h2>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Info label="Origine" valeur={labelDe(ORIGINES, animal.origine)} />
              <Info label="Entrée" valeur={formatDate(animal.dateEntree)} />
              <Info label="Coût d'achat" valeur={fmt(animal.coutAchat)} />
            </dl>
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold">Filiation</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Info
                label="Mère"
                valeur={
                  animal.mere ? (
                    <Link
                      className="text-primary hover:underline"
                      href={`/troupeau/${animal.mere.id}`}
                    >
                      n°{animal.mere.numero}
                    </Link>
                  ) : (
                    "—"
                  )
                }
              />
              <Info
                label="Père"
                valeur={
                  animal.pere ? (
                    <Link
                      className="text-primary hover:underline"
                      href={`/troupeau/${animal.pere.id}`}
                    >
                      n°{animal.pere.numero}
                    </Link>
                  ) : animal.pereExterieur ? (
                    `${animal.pereExterieur} (extérieur)`
                  ) : (
                    "—"
                  )
                }
              />
            </dl>
            {enfants.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Descendance ({enfants.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {enfants.map((e) => (
                    <Link
                      key={e.id}
                      href={`/troupeau/${e.id}`}
                      className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-border/40"
                    >
                      n°{e.numero}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {animal.vente && (
            <Card>
              <h2 className="mb-4 font-semibold">Vente</h2>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Info label="Date" valeur={formatDate(animal.vente.date)} />
                <Info label="Prix" valeur={fmt(animal.vente.prix)} />
                <Info label="Acheteur" valeur={animal.vente.acheteur} />
                <Info
                  label="Poids"
                  valeur={animal.vente.poids ? `${animal.vente.poids} kg` : "—"}
                />
                <Info
                  label="Prix / kg"
                  valeur={fmt(animal.vente.prixAuKilo)}
                />
                <Info
                  label="Motif"
                  valeur={labelDe(MOTIFS_VENTE, animal.vente.motif)}
                />
                <Info label="Marge" valeur={fmt(animal.vente.marge)} />
              </dl>
            </Card>
          )}

          <Card>
            <h2 className="mb-4 font-semibold">Suivi santé</h2>
            <SanteForm animalId={animal.id} />
            <div className="mt-4 divide-y divide-border">
              {animal.evenementsSante.length === 0 ? (
                <p className="text-sm text-muted">Aucun événement enregistré.</p>
              ) : (
                animal.evenementsSante.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {labelDe(TYPES_SANTE, ev.type)}
                      </span>
                      <span className="ml-2 text-xs text-muted">
                        {formatDate(ev.date)}
                      </span>
                      {ev.note && (
                        <p className="text-xs text-muted">{ev.note}</p>
                      )}
                    </div>
                    <ConfirmButton
                      variant="neutral"
                      confirmation="Supprimer cet événement ?"
                      action={supprimerEvenementSanteAction.bind(
                        null,
                        ev.id,
                        animal.id,
                      )}
                    >
                      ✕
                    </ConfirmButton>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
