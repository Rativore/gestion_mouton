"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TOUTES_ANNEES } from "@/lib/constants";

export function AnneeSelect({
  annees,
  valeur,
}: {
  annees: number[];
  valeur: number | typeof TOUTES_ANNEES;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      value={valeur}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams);
        params.set("annee", e.target.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="field w-auto"
      aria-label="Année"
    >
      <option value={TOUTES_ANNEES}>Toutes les années</option>
      {annees.map((a) => (
        <option key={a} value={a}>
          {a}
        </option>
      ))}
    </select>
  );
}
