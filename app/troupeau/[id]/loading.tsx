import { Card, Skeleton } from "@/components/ui";
import { SqueletteEntete } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <SqueletteEntete />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_3fr]">
        {/* Photo + identité */}
        <Card className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </Card>
        {/* Détails */}
        <Card className="space-y-3">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
