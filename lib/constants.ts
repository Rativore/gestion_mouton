// Constantes métier partagées (options des formulaires, catégories par défaut).

export const ESPECES = [
  { value: "mouton", label: "Mouton" },
  { value: "chevre", label: "Chèvre" },
] as const;

export const SEXES = [
  { value: "F", label: "Femelle" },
  { value: "M", label: "Mâle" },
] as const;

export const STATUTS = [
  { value: "present", label: "Présent" },
  { value: "vendu", label: "Vendu" },
  { value: "mort", label: "Mort" },
] as const;

export const ORIGINES = [
  { value: "naissance", label: "Naissance" },
  { value: "achat", label: "Achat" },
] as const;

export const TYPES_SANTE = [
  { value: "vaccin", label: "Vaccin" },
  { value: "vermifuge", label: "Vermifuge" },
  { value: "veto", label: "Visite vétérinaire" },
  { value: "traitement", label: "Traitement" },
  { value: "autre", label: "Autre" },
] as const;

export const MOTIFS_VENTE = [
  { value: "boucherie", label: "Boucherie" },
  { value: "reproduction", label: "Reproduction" },
  { value: "reforme", label: "Réforme" },
  { value: "autre", label: "Autre" },
] as const;

export const MOTIFS_DECES = [
  { value: "maladie", label: "Maladie" },
  { value: "predateur", label: "Prédateur" },
  { value: "accident", label: "Accident" },
  { value: "mortalite", label: "Mortalité naturelle" },
  { value: "abattage", label: "Abattage" },
  { value: "autre", label: "Autre" },
] as const;

// Catégories fournies par défaut (toujours présentes). L'utilisateur peut en
// ajouter d'autres, stockées dans la table Categorie.
export const CATEGORIES_DEFAUT: Record<"gain" | "depense", string[]> = {
  gain: [
    "Vente d'animal",
    "Vente de laine",
    "Vente de lait / fromage",
    "Subvention / aide",
    "Autre gain",
  ],
  depense: [
    "Alimentation / fourrage",
    "Vétérinaire / santé",
    "Achat d'animal",
    "Matériel / équipement",
    "Clôture / abri",
    "Transport",
    "Autre dépense",
  ],
};

// Catégorie utilisée automatiquement lors de la vente d'un animal.
export const CATEGORIE_VENTE_ANIMAL = "Vente d'animal";

// Catégorie utilisée automatiquement lors de l'achat d'un animal.
export const CATEGORIE_ACHAT_ANIMAL = "Achat d'animal";

// Valeurs spéciales du sélecteur de sous-type dans la saisie Achat/Vente.
// Un sous-type « animal » est encodé "__animal__:<espece>" (ex "__animal__:mouton").
export const SOUS_TYPE_ANIMAL_PREFIX = "__animal__:";
export const SOUS_TYPE_AUTRE = "__autre__";

// Valeur spéciale du sélecteur de père : père hors troupeau (bélier extérieur).
// Partagée entre le formulaire (components/animal-form) et l'action de saisie.
export const PERE_EXTERIEUR = "__exterieur__";

/** Emoji illustratif d'une espèce (générique si inconnue). */
export function emojiEspece(value: string): string {
  if (value === "chevre") return "🐐";
  if (value === "mouton") return "🐑";
  return "🐾";
}

// Devises disponibles dans les réglages.
export const DEVISES = [
  { code: "EUR", label: "Euro (€)" },
  { code: "CHF", label: "Franc suisse (CHF)" },
  { code: "USD", label: "Dollar US ($)" },
  { code: "GBP", label: "Livre sterling (£)" },
  { code: "CAD", label: "Dollar canadien (CA$)" },
  { code: "XOF", label: "Franc CFA (FCFA)" },
  { code: "TND", label: "Dinar tunisien (DT)" },
] as const;

export const DEVISE_DEFAUT = "EUR";

/** Valeur du sélecteur de période « toutes les années » (compta). */
export const TOUTES_ANNEES = "toutes";

export function labelDe(
  liste: readonly { value: string; label: string }[],
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return liste.find((o) => o.value === value)?.label ?? value;
}
