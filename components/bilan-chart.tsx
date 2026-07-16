export type PointGraphe = { label: string; gains: number; depenses: number };

/** Histogramme gains/dépenses en CSS pur (par mois ou par année). */
export function BilanChart({ points }: { points: PointGraphe[] }) {
  const max = Math.max(
    1,
    ...points.map((p) => Math.max(p.gains, p.depenses)),
  );

  return (
    <div>
      <div className="flex items-end gap-1 sm:gap-2" style={{ height: 180 }}>
        {points.map((p) => (
          <div
            key={p.label}
            className="flex flex-1 items-end justify-center gap-0.5"
            title={`${p.label} — Gains ${p.gains} € / Dépenses ${p.depenses} €`}
          >
            <div
              className="w-full max-w-3 rounded-t bg-gain"
              style={{ height: `${(p.gains / max) * 160}px` }}
            />
            <div
              className="w-full max-w-3 rounded-t bg-depense"
              style={{ height: `${(p.depenses / max) * 160}px` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1 sm:gap-2">
        {points.map((p) => (
          <div
            key={p.label}
            className="flex-1 text-center text-[0.6rem] text-muted"
          >
            {p.label}
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
