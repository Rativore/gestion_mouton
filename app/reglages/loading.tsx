import { Card, Skeleton } from "@/components/ui";
import { SqueletteEntete } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <SqueletteEntete />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56 max-w-full" />
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
            <Skeleton className="h-10 w-full" />
          </Card>
        ))}
      </div>
    </>
  );
}
