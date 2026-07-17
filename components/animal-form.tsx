"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { enregistrerAnimalAction } from "@/app/actions/animaux";
import type { EtatFormulaire } from "@/lib/validation";
import { SubmitButton } from "@/components/submit-button";
import { SEXES, ORIGINES, PERE_EXTERIEUR } from "@/lib/constants";
import { toDateInput } from "@/lib/utils";

type ParentOption = {
  id: string;
  numero: string;
  espece: string;
  sexe: string | null;
};

export type AnimalInitial = {
  id?: string;
  numero?: string;
  espece?: string;
  sexe?: string | null;
  race?: string | null;
  dateNaissance?: Date | string | null;
  couleur?: string | null;
  signes?: string | null;
  origine?: string | null;
  dateEntree?: Date | string | null;
  coutAchat?: number | null;
  mereId?: string | null;
  pereId?: string | null;
  pereExterieur?: string | null;
  note?: string | null;
  photoUrl?: string | null;
};

export function AnimalForm({
  initial = {},
  parents,
  especes,
  verrouillerNaissance = false,
}: {
  initial?: AnimalInitial;
  parents: ParentOption[];
  especes: { value: string; label: string }[];
  /** Ajout depuis le Troupeau : force une naissance (les achats passent par Achat/Vente). */
  verrouillerNaissance?: boolean;
}) {
  const [state, formAction] = useActionState<EtatFormulaire, FormData>(
    enregistrerAnimalAction,
    {},
  );
  const edition = Boolean(initial.id);
  const retour = edition ? `/troupeau/${initial.id}` : "/troupeau";
  const [origine, setOrigine] = useState(
    verrouillerNaissance ? "naissance" : (initial.origine ?? "naissance"),
  );
  const estAchat = !verrouillerNaissance && origine === "achat";
  const meres = parents.filter((p) => p.sexe === "F");
  const peres = parents.filter((p) => p.sexe === "M");
  const [pere, setPere] = useState(
    initial.pereExterieur ? PERE_EXTERIEUR : (initial.pereId ?? ""),
  );

  return (
    <form action={formAction} className="space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      {state.error && (
        <p className="rounded-lg bg-depense/10 px-4 py-3 text-sm font-medium text-depense">
          {state.error}
        </p>
      )}

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-4 font-semibold">Identité</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="numero">
              Numéro *
            </label>
            <input
              id="numero"
              name="numero"
              required
              defaultValue={initial.numero ?? ""}
              className="field"
              placeholder="Ex : 042"
            />
          </div>
          <div>
            <label className="label" htmlFor="espece">
              Espèce *
            </label>
            <select
              id="espece"
              name="espece"
              required
              defaultValue={initial.espece ?? ""}
              className="field"
            >
              <option value="" disabled>
                Choisir…
              </option>
              {especes.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sexe">
              Sexe
            </label>
            <select
              id="sexe"
              name="sexe"
              defaultValue={initial.sexe ?? ""}
              className="field"
            >
              <option value="">—</option>
              {SEXES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="race">
              Race
            </label>
            <input
              id="race"
              name="race"
              defaultValue={initial.race ?? ""}
              className="field"
            />
          </div>
          <div>
            <label className="label" htmlFor="dateNaissance">
              Date de naissance
            </label>
            <input
              id="dateNaissance"
              name="dateNaissance"
              type="date"
              defaultValue={toDateInput(initial.dateNaissance)}
              className="field"
            />
          </div>
          <div>
            <label className="label" htmlFor="couleur">
              Couleur
            </label>
            <input
              id="couleur"
              name="couleur"
              defaultValue={initial.couleur ?? ""}
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="signes">
              Signes distinctifs
            </label>
            <input
              id="signes"
              name="signes"
              defaultValue={initial.signes ?? ""}
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="photo">
              Photo {edition && initial.photoUrl && "(laisser vide pour garder l'actuelle)"}
            </label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              className="field"
            />
          </div>
        </div>
      </section>

      {!verrouillerNaissance && (
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-4 font-semibold">Provenance</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="origine">
              Origine
            </label>
            <select
              id="origine"
              name="origine"
              value={origine}
              onChange={(e) => setOrigine(e.target.value)}
              className="field"
            >
              {ORIGINES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="dateEntree">
              Date d&apos;entrée {estAchat && "*"}
            </label>
            <input
              id="dateEntree"
              name="dateEntree"
              type="date"
              required={estAchat}
              defaultValue={toDateInput(initial.dateEntree)}
              className="field"
            />
          </div>
          {estAchat && (
            <div>
              <label className="label" htmlFor="coutAchat">
                Coût d&apos;achat (€)
              </label>
              <input
                id="coutAchat"
                name="coutAchat"
                type="number"
                step="0.01"
                min="0"
                defaultValue={initial.coutAchat ?? ""}
                className="field"
              />
            </div>
          )}
        </div>
      </section>
      )}

      {!estAchat && (
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-4 font-semibold">Filiation</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="mereId">
              Mère
            </label>
            <select
              id="mereId"
              name="mereId"
              defaultValue={initial.mereId ?? ""}
              className="field"
            >
              <option value="">—</option>
              {meres.map((p) => (
                <option key={p.id} value={p.id}>
                  n°{p.numero} ({p.espece})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pereId">
              Père
            </label>
            <select
              id="pereId"
              name="pereId"
              value={pere}
              onChange={(e) => setPere(e.target.value)}
              className="field"
            >
              <option value="">—</option>
              {peres.map((p) => (
                <option key={p.id} value={p.id}>
                  n°{p.numero} ({p.espece})
                </option>
              ))}
              <option value={PERE_EXTERIEUR}>Mâle extérieur</option>
            </select>
          </div>
        </div>
        {pere === PERE_EXTERIEUR && (
          <div className="mt-4">
            <label className="label" htmlFor="pereExterieur">
              Identité du mâle extérieur
            </label>
            <input
              id="pereExterieur"
              name="pereExterieur"
              defaultValue={initial.pereExterieur ?? ""}
              className="field"
              placeholder="Ex : Bélier de M. Dupont"
            />
          </div>
        )}
      </section>
      )}

      <section className="rounded-xl border border-border bg-surface p-4">
        <label className="label" htmlFor="note">
          Note libre
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          defaultValue={initial.note ?? ""}
          className="field"
        />
      </section>

      <div className="flex gap-3">
        <SubmitButton>{edition ? "Enregistrer" : "Ajouter l'animal"}</SubmitButton>
        <Link
          href={retour}
          className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-border/50"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
