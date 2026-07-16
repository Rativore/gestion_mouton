/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

/** Photo de l'animal, ou pictogramme selon l'espèce si absente. */
export function AnimalPhoto({
  photoUrl,
  espece,
  alt,
  className,
}: {
  photoUrl?: string | null;
  espece?: string | null;
  alt: string;
  className?: string;
}) {
  const emoji = espece === "chevre" ? "🐐" : "🐑";
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-border/40 text-3xl",
        className,
      )}
      aria-label={alt}
    >
      {emoji}
    </div>
  );
}
