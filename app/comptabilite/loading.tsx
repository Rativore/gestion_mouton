import { Card, Skeleton } from "@/components/ui";
import { SqueletteEntete, SqueletteStats, SqueletteListe } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <SqueletteEntete />
      <SqueletteStats n={3} />
      <Card className="mb-6">
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="h-48 w-full" />
      </Card>
      <SqueletteListe lignes={6} />
    </>
  );
}
