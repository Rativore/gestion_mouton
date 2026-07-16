"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "danger" | "neutral";
}) {
  const { pending } = useFormStatus();
  const styles = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    danger: "bg-depense text-white hover:opacity-90",
    neutral: "border border-border bg-surface hover:bg-border/50",
  }[variant];
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
        styles,
        className,
      )}
    >
      {pending ? "…" : children}
    </button>
  );
}
