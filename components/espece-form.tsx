"use client";

import { ajouterEspeceAction } from "@/app/actions/especes";
import { useFormulaire } from "@/lib/use-formulaire";
import { SubmitButton } from "@/components/submit-button";

export function EspeceForm() {
  const { state, formAction, ref } = useFormulaire(ajouterEspeceAction);

  return (
    <form ref={ref} action={formAction} className="flex items-end gap-2">
      <div className="grow">
        <input
          name="nom"
          required
          className="field"
          placeholder="Nouvelle espèce (ex : Vache)…"
        />
        {state.error && (
          <p className="mt-1 text-xs font-medium text-depense">{state.error}</p>
        )}
      </div>
      <SubmitButton variant="neutral">Ajouter</SubmitButton>
    </form>
  );
}
