import { Card, Skeleton } from "@/components/ui";

/** En-tête de page (titre + éventuel sous-titre). */
export function SqueletteEntete({ sousTitre = true }: { sousTitre?: boolean }) {
  return (
    <div className="mb-6 space-y-2">
      <Skeleton className="h-8 w-44" />
      {sousTitre && <Skeleton className="h-4 w-64 max-w-full" />}
    </div>
  );
}

/** Rangée de cartes de statistiques. */
export function SqueletteStats({ n = 4 }: { n?: number }) {
  return (
    <div
      className="mb-6 grid gap-4"
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: n }).map((_, i) => (
        <Card key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-6 w-20" />
        </Card>
      ))}
    </div>
  );
}

/** Liste de lignes dans une carte (tableau/journal). */
export function SqueletteListe({ lignes = 6 }: { lignes?: number }) {
  return (
    <Card className="space-y-3">
      {Array.from({ length: lignes }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-40 max-w-[55%]" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </Card>
  );
}
