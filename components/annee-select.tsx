"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function AnneeSelect({ annees, valeur }: { annees: number[]; valeur: number }) {
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
      {annees.map((a) => (
        <option key={a} value={a}>
          {a}
        </option>
      ))}
    </select>
  );
}
