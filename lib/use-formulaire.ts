import { useActionState, useEffect, useRef } from "react";
import type { EtatFormulaire } from "@/lib/validation";

type ActionFormulaire = (
  etatPrecedent: EtatFormulaire,
  formData: FormData,
) => Promise<EtatFormulaire>;

/**
 * Échafaudage commun des petits formulaires : `useActionState` typé
 * `EtatFormulaire` + réinitialisation du formulaire après un envoi réussi
 * (absence de `state.error`). `onSucces` (optionnel) permet un nettoyage
 * additionnel côté client (ex. remettre un état local à zéro).
 *
 * Retourne `{ state, formAction, ref }` : brancher `ref` et `action={formAction}`
 * sur le `<form>`.
 */
export function useFormulaire(action: ActionFormulaire, onSucces?: () => void) {
  const [state, formAction] = useActionState<EtatFormulaire, FormData>(
    action,
    {},
  );
  const ref = useRef<HTMLFormElement>(null);
  // Garde la dernière closure d'onSucces sans l'ajouter aux dépendances de
  // l'effet de reset (qui ne doit se déclencher que sur un changement de `state`).
  const onSuccesRef = useRef(onSucces);
  useEffect(() => {
    onSuccesRef.current = onSucces;
  });

  useEffect(() => {
    if (!state.error) {
      ref.current?.reset();
      onSuccesRef.current?.();
    }
  }, [state]);

  return { state, formAction, ref };
}
