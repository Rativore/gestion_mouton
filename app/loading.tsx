import { Card, Skeleton } from "@/components/ui";
import { SqueletteEntete, SqueletteStats } from "@/components/skeletons";

// Écran de chargement de l'accueil (feedback instantané à la navigation).
export default function Loading() {
  return (
    <>
      <SqueletteEntete />
      <SqueletteStats n={4} />
      <div className="mb-6 flex gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="space-y-3">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </Card>
        ))}
      </div>
    </>
  );
}
