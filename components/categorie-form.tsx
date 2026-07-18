"use client";

import { ajouterCategorieAction } from "@/app/actions/categories";
import { useFormulaire } from "@/lib/use-formulaire";
import { SubmitButton } from "@/components/submit-button";

export function CategorieForm({ typeFlux }: { typeFlux: "gain" | "depense" }) {
  const { state, formAction, ref } = useFormulaire(ajouterCategorieAction);

  return (
    <form ref={ref} action={formAction} className="flex items-end gap-2">
      <input type="hidden" name="typeFlux" value={typeFlux} />
      <div className="grow">
        <input
          name="nom"
          required
          className="field"
          placeholder="Nouvelle catégorie…"
        />
        {state.error && (
          <p className="mt-1 text-xs font-medium text-depense">{state.error}</p>
        )}
      </div>
      <SubmitButton variant="neutral">Ajouter</SubmitButton>
    </form>
  );
}
