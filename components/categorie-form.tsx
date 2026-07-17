"use client";

import { useActionState, useEffect, useRef } from "react";
import { ajouterCategorieAction } from "@/app/actions/categories";
import type { EtatFormulaire } from "@/lib/validation";
import { SubmitButton } from "@/components/submit-button";

export function CategorieForm({ typeFlux }: { typeFlux: "gain" | "depense" }) {
  const [state, formAction] = useActionState<EtatFormulaire, FormData>(
    ajouterCategorieAction,
    {},
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error) ref.current?.reset();
  }, [state]);

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
