import type { BilanMensuel } from "@/lib/services/comptabilite";
import { MOIS_COURTS } from "@/lib/utils";

/** Histogramme mensuel gains/dépenses en CSS pur. */
export function BilanChart({ parMois }: { parMois: BilanMensuel[] }) {
  const max = Math.max(
    1,
    ...parMois.map((m) => Math.max(m.gains, m.depenses)),
  );

  return (
    <div>
      <div className="flex items-end gap-1 sm:gap-2" style={{ height: 180 }}>
        {parMois.map((m) => (
          <div
            key={m.mois}
            className="flex flex-1 items-end justify-center gap-0.5"
            title={`${MOIS_COURTS[m.mois - 1]} — Gains ${m.gains} € / Dépenses ${m.depenses} €`}
          >
            <div
              className="w-full max-w-3 rounded-t bg-gain"
              style={{ height: `${(m.gains / max) * 160}px` }}
            />
            <div
              className="w-full max-w-3 rounded-t bg-depense"
              style={{ height: `${(m.depenses / max) * 160}px` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1 sm:gap-2">
        {parMois.map((m) => (
          <div
            key={m.mois}
            className="flex-1 text-center text-[0.6rem] text-muted"
          >
            {MOIS_COURTS[m.mois - 1]}
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-gain" /> Gains
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-depense" /> Dépenses
        </span>
      </div>
    </div>
  );
}
