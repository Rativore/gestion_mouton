"use client";

import { useActionState } from "react";
import { connexionAction, type EtatConnexion } from "@/app/actions/auth";

const ETAT_INITIAL: EtatConnexion = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(
    connexionAction,
    ETAT_INITIAL,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className="rounded-lg border border-border bg-surface px-3 py-2 text-base"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Mot de passe
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="rounded-lg border border-border bg-surface px-3 py-2 text-base"
        />
      </label>

      {state.error && (
        <p className="text-sm text-depense" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
