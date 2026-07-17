"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { enregistrerSaisieAction } from "@/app/actions/saisie";
import type { EtatFormulaire } from "@/lib/validation";
import { SubmitButton } from "@/components/submit-button";
import {
  MOTIFS_VENTE,
  SEXES,
  SOUS_TYPE_ANIMAL_PREFIX,
  SOUS_TYPE_AUTRE,
} from "@/lib/constants";
import { toDateInput } from "@/lib/utils";

type AnimalOption = {
  id: string;
  numero: string;
  espece: string;
  coutAchat: number | null;
};

type Espece = { value: string; label: string };
type Flux = "achat" | "vente";

export function SaisieForm({
  animaux,
  especes,
  categoriesAchat,
  categoriesVente,
  initialAnimalId,
}: {
  animaux: AnimalOption[];
  especes: Espece[];
  categoriesAchat: string[];
  categoriesVente: string[];
  initialAnimalId?: string;
}) {
  const [state, formAction] = useActionState<EtatFormulaire, FormData>(
    enregistrerSaisieAction,
    {},
  );

  const animalInitial = initialAnimalId
    ? animaux.find((a) => a.id === initialAnimalId)
    : undefined;

  const [flux, setFlux] = useState<Flux>(animalInitial ? "vente" : "achat");
  const [sousType, setSousType] = useState(
    animalInitial ? SOUS_TYPE_ANIMAL_PREFIX + animalInitial.espece : "",
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error) {
      ref.current?.reset();
      setSousType("");
    }
  }, [state]);

  const estAnimal = sousType.startsWith(SOUS_TYPE_ANIMAL_PREFIX);
  const especeAnimal = estAnimal
    ? sousType.slice(SOUS_TYPE_ANIMAL_PREFIX.length)
    : "";
  const labelEspece =
    especes.find((e) => e.value === especeAnimal)?.label ?? especeAnimal;
  const categories = flux === "achat" ? categoriesAchat : categoriesVente;
  const animauxEspece = animaux.filter((a) => a.espece === especeAnimal);

  const montantLabel =
    estAnimal && flux === "achat"
      ? "Coût d'achat (€) *"
      : estAnimal && flux === "vente"
        ? "Prix de vente (€) *"
        : "Montant (€) *";
  const dateLabel = estAnimal && flux === "achat" ? "Date d'entrée *" : "Date *";

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <input type="hidden" name="flux" value={flux} />

      {state.error && (
        <p className="rounded-lg bg-depense/10 px-3 py-2 text-sm font-medium text-depense">
          {state.error}
        </p>
      )}

      {/* Onglets Achat / Vente */}
      <div className="grid grid-cols-2 gap-2">
        {(["achat", "vente"] as const).map((f) => {
          const actif = flux === f;
          const couleur =
            f === "achat"
              ? "border-depense bg-depense/10 text-depense"
              : "border-gain bg-gain/10 text-gain";
          return (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFlux(f);
                setSousType("");
              }}
              className={`rounded-lg border px-3 py-2 text-center text-sm font-semibold transition-colors ${
                actif ? couleur : "border-border text-muted"
              }`}
            >
              {f === "achat" ? "Achat (dépense)" : "Vente (gain)"}
            </button>
          );
        })}
      </div>

      {/* Sous-type */}
      <div>
        <label className="label" htmlFor="sousType">
          {flux === "achat" ? "Type d'achat" : "Type de vente"} *
        </label>
        <select
          id="sousType"
          name="sousType"
          required
          value={sousType}
          onChange={(e) => setSousType(e.target.value)}
          className="field"
        >
          <option value="" disabled>
            Choisir…
          </option>
          {especes.map((e) => (
            <option key={e.value} value={SOUS_TYPE_ANIMAL_PREFIX + e.value}>
              {flux === "achat" ? "Achat" : "Vente"} — {e.label}
            </option>
          ))}
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value={SOUS_TYPE_AUTRE}>+ Autre (saisir)…</option>
        </select>
      </div>

      {sousType === SOUS_TYPE_AUTRE && (
        <div>
          <label className="label" htmlFor="categorieLibre">
            Nouvelle catégorie
          </label>
          <input
            id="categorieLibre"
            name="categorieLibre"
            required
            className="field"
            placeholder={flux === "achat" ? "Ex : Clôture" : "Ex : Tonte"}
          />
        </div>
      )}

      {/* Cas ACHAT d'un animal : création de la bête */}
      {estAnimal && flux === "achat" && (
        <div className="space-y-4 rounded-lg border border-border bg-background/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Nouvelle bête ({labelEspece})
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="numero">
                Numéro *
              </label>
              <input id="numero" name="numero" required className="field" />
            </div>
            <div>
              <label className="label" htmlFor="sexe">
                Sexe
              </label>
              <select id="sexe" name="sexe" defaultValue="" className="field">
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
              <input id="race" name="race" className="field" />
            </div>
            <div>
              <label className="label" htmlFor="dateNaissance">
                Naissance
              </label>
              <input
                id="dateNaissance"
                name="dateNaissance"
                type="date"
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor="couleur">
                Couleur
              </label>
              <input id="couleur" name="couleur" className="field" />
            </div>
            <div>
              <label className="label" htmlFor="signes">
                Signes
              </label>
              <input id="signes" name="signes" className="field" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="photo">
              Photo
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
      )}

      {/* Cas VENTE d'un animal : sélection de la bête */}
      {estAnimal && flux === "vente" && (
          <>
            <div>
              <label className="label" htmlFor="animalId">
                Animal à vendre *
              </label>
              <select
                id="animalId"
                name="animalId"
                required
                defaultValue={animalInitial?.id ?? ""}
                className="field"
              >
                <option value="" disabled>
                  Choisir…
                </option>
                {animauxEspece.map((a) => (
                  <option key={a.id} value={a.id}>
                    n°{a.numero}
                    {a.coutAchat != null ? ` — acheté ${a.coutAchat} €` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="poids">
                  Poids (kg)
                </label>
                <input
                  id="poids"
                  name="poids"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor="motif">
                  Motif
                </label>
                <select id="motif" name="motif" className="field" defaultValue="">
                  <option value="">—</option>
                  {MOTIFS_VENTE.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="acheteur">
                Acheteur
              </label>
              <input
                id="acheteur"
                name="acheteur"
                className="field"
                placeholder="Nom / coordonnées"
              />
            </div>
          </>
      )}

      {/* Note pour un mouvement simple */}
      {!estAnimal && sousType && (
        <div>
          <label className="label" htmlFor="note">
            Note
          </label>
          <input id="note" name="note" className="field" placeholder="Optionnel" />
        </div>
      )}

      {/* Montant + date, communs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="montant">
            {montantLabel}
          </label>
          <input
            id="montant"
            name="montant"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="date">
            {dateLabel}
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={toDateInput(new Date())}
            className="field"
          />
        </div>
      </div>

      <SubmitButton className="w-full">
        {flux === "achat" ? "Enregistrer l'achat" : "Enregistrer la vente"}
      </SubmitButton>
    </form>
  );
}
