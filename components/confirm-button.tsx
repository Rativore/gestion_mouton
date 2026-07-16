"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";

/**
 * Bouton qui exécute une server action (déjà liée à ses arguments via .bind)
 * après confirmation. Utilisé pour supprimer / annuler.
 */
export function ConfirmButton({
  action,
  confirmation,
  children,
  className,
  variant = "danger",
}: {
  action: () => Promise<unknown>;
  confirmation: string;
  children: React.ReactNode;
  className?: string;
  variant?: "danger" | "neutral";
}) {
  const [pending, startTransition] = useTransition();
  const styles =
    variant === "danger"
      ? "text-depense hover:bg-depense/10"
      : "text-muted hover:bg-border/50";
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmation)) {
          startTransition(async () => {
            await action();
          });
        }
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
        styles,
        className,
      )}
    >
      {pending ? "…" : children}
    </button>
  );
}
