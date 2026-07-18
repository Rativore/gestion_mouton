import { Skeleton } from "@/components/ui";
import { SqueletteEntete, SqueletteListe } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <SqueletteEntete sousTitre={false} />
      {/* Onglets */}
      <div className="mb-4 flex gap-2 border-b border-border pb-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-28" />
      </div>
      {/* Recherche */}
      <Skeleton className="mb-6 h-10 w-full" />
      <SqueletteListe lignes={7} />
    </>
  );
}
