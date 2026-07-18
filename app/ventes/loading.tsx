import { Card, Skeleton } from "@/components/ui";
import { SqueletteEntete, SqueletteStats, SqueletteListe } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <SqueletteEntete />
      <SqueletteStats n={2} />
      {/* Formulaire de saisie */}
      <Card className="mb-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </Card>
      <SqueletteListe lignes={5} />
    </>
  );
}
