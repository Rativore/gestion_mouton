import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  titre,
  sousTitre,
  action,
}: {
  titre: string;
  sousTitre?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{titre}</h1>
        {sousTitre && <p className="mt-1 text-sm text-muted">{sousTitre}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  valeur,
  accent,
}: {
  label: string;
  valeur: string;
  accent?: "gain" | "depense" | "neutral";
}) {
  const couleur =
    accent === "gain"
      ? "text-gain"
      : accent === "depense"
        ? "text-depense"
        : "text-foreground";
  return (
    <Card className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      {/* Taille adaptative : se réduit sur écran étroit ; en dernier recours,
          un très grand nombre passe à la ligne au lieu de déborder de la case. */}
      <span
        className={cn(
          "text-[clamp(1.125rem,5vw,1.5rem)] font-bold leading-tight tabular-nums [overflow-wrap:anywhere]",
          couleur,
        )}
      >
        {valeur}
      </span>
    </Card>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "present" | "vendu" | "mort" | "gain" | "depense";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-border/60 text-foreground",
    present: "bg-primary/15 text-primary",
    vendu: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    mort: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
    gain: "bg-gain/15 text-gain",
    depense: "bg-depense/15 text-depense",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  titre,
  description,
  action,
}: {
  titre: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-lg font-semibold">{titre}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </Card>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "neutral";
}) {
  const styles =
    variant === "primary"
      ? "bg-primary text-white hover:bg-primary-hover"
      : "border border-border bg-surface hover:bg-border/50";
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
        styles,
      )}
    >
      {children}
    </Link>
  );
}
