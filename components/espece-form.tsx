"use client";

import { useActionState, useEffect, useRef } from "react";
import { ajouterEspeceAction } from "@/app/actions/especes";
import type { EtatFormulaire } from "@/lib/validation";
import { SubmitButton } from "@/components/submit-button";

export function EspeceForm() {
  const [state, formAction] = useActionState<EtatFormulaire, FormData>(
    ajouterEspeceAction,
    {},
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error) ref.current?.reset();
  }, [state]);

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
