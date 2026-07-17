// Utilitaires de formatage et de calcul.

// Formateurs de devise mémorisés par code (EUR, CHF, USD…).
const formatteurs = new Map<string, Intl.NumberFormat>();

function formatteurDevise(devise: string) {
  let f = formatteurs.get(devise);
  if (!f) {
    f = new Intl.NumberFormat("fr-FR", { style: "currency", currency: devise });
    formatteurs.set(devise, f);
  }
  return f;
}

/** Formate un montant dans la devise choisie (EUR par défaut). */
export function formatMontant(
  montant: number | null | undefined,
  devise = "EUR",
): string {
  if (montant == null) return "—";
  return formatteurDevise(devise).format(montant);
}

/**
 * Fabrique un formateur de montant lié à une devise, pour éviter de répéter
 * `(n) => formatMontant(n, devise)` dans chaque page.
 */
export function creerFmt(devise: string) {
  return (montant: number | null | undefined) => formatMontant(montant, devise);
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return dateFormatter.format(new Date(date));
}

/** Convertit une Date en valeur pour <input type="date"> (YYYY-MM-DD). */
export function toDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mois}-${jour}`;
}

/** Âge lisible à partir d'une date de naissance. */
export function calculerAge(
  dateNaissance: Date | string | null | undefined,
  reference: Date = new Date(),
): string {
  if (!dateNaissance) return "—";
  const naiss = new Date(dateNaissance);
  let mois =
    (reference.getFullYear() - naiss.getFullYear()) * 12 +
    (reference.getMonth() - naiss.getMonth());
  if (reference.getDate() < naiss.getDate()) mois -= 1;
  if (mois < 0) return "—";
  const annees = Math.floor(mois / 12);
  const moisRestants = mois % 12;
  if (annees === 0) return `${moisRestants} mois`;
  if (moisRestants === 0) return `${annees} an${annees > 1 ? "s" : ""}`;
  return `${annees} an${annees > 1 ? "s" : ""} et ${moisRestants} mois`;
}

export const MOIS_COURTS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

/** Petit helper de composition de classes conditionnelles. */
export function cn(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}

/** Lit une valeur numérique optionnelle d'un FormData. */
export function nombreOptionnel(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Lit une chaîne optionnelle d'un FormData (vide -> null). */
export function texteOptionnel(v: FormDataEntryValue | null): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

/** Lit une date optionnelle d'un FormData. */
export function dateOptionnelle(v: FormDataEntryValue | null): Date | null {
  if (v == null || v === "") return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}
