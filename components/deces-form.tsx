"use client";

import { useActionState } from "react";
import { marquerMortAction } from "@/app/actions/animaux";
import type { EtatFormulaire } from "@/lib/validation";
import { SubmitButton } from "@/components/submit-button";
import { MOTIFS_DECES } from "@/lib/constants";

/** Déclare le décès d'un animal (date + motif). Affiché tant qu'il est présent. */
export function DecesForm({ animalId }: { animalId: string }) {
  const [state, formAction] = useActionState<EtatFormulaire, FormData>(
    marquerMortAction,
    {},
  );

  return (
    <form
      action={formAction}
      className="space-y-2 rounded-lg border border-border p-3"
    >
      <p className="text-sm font-semibold">Déclarer le décès</p>
      <input type="hidden" name="animalId" value={animalId} />
      <div>
        <label className="label" htmlFor="dateDeces">
          Date
        </label>
        <input
          id="dateDeces"
          name="dateDeces"
          type="date"
          className="field"
        />
        <p className="mt-1 text-xs text-muted">Vide = aujourd&apos;hui.</p>
      </div>
      <div>
        <label className="label" htmlFor="motifDeces">
          Motif
        </label>
        <select
          id="motifDeces"
          name="motifDeces"
          className="field"
          defaultValue=""
        >
          <option value="">—</option>
          {MOTIFS_DECES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <SubmitButton variant="neutral">Marquer comme mort</SubmitButton>
      {state.error && (
        <p className="text-sm font-medium text-depense">{state.error}</p>
      )}
    </form>
  );
}
