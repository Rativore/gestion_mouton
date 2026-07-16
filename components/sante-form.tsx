"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  ajouterEvenementSanteAction,
  type EtatFormulaire,
} from "@/app/actions/animaux";
import { SubmitButton } from "@/components/submit-button";
import { TYPES_SANTE } from "@/lib/constants";

export function SanteForm({ animalId }: { animalId: string }) {
  const [state, formAction] = useActionState<EtatFormulaire, FormData>(
    ajouterEvenementSanteAction,
    {},
  );
  const ref = useRef<HTMLFormElement>(null);

  // Réinitialise le formulaire après un ajout réussi.
  useEffect(() => {
    if (!state.error) ref.current?.reset();
  }, [state]);

  return (
    <form
      ref={ref}
      action={formAction}
      className="flex flex-wrap items-end gap-3"
    >
      <input type="hidden" name="animalId" value={animalId} />
      <div>
        <label className="label" htmlFor="type">
          Type
        </label>
        <select id="type" name="type" required className="field" defaultValue="">
          <option value="" disabled>
            Choisir…
          </option>
          {TYPES_SANTE.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="date">
          Date
        </label>
        <input id="date" name="date" type="date" required className="field" />
      </div>
      <div className="grow">
        <label className="label" htmlFor="note">
          Note
        </label>
        <input id="note" name="note" className="field" placeholder="Optionnel" />
      </div>
      <SubmitButton variant="neutral">Ajouter</SubmitButton>
      {state.error && (
        <p className="w-full text-sm font-medium text-depense">{state.error}</p>
      )}
    </form>
  );
}
