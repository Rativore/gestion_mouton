"use client";

import { ajouterEvenementSanteAction } from "@/app/actions/animaux";
import { useFormulaire } from "@/lib/use-formulaire";
import { SubmitButton } from "@/components/submit-button";
import { TYPES_SANTE } from "@/lib/constants";

export function SanteForm({ animalId }: { animalId: string }) {
  const { state, formAction, ref } = useFormulaire(ajouterEvenementSanteAction);

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
