import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { formatDate, formatMontant } from "@/lib/utils";

// Palette (alignée sur le thème de l'app).
const VERT = rgb(0.247, 0.49, 0.227); // #3f7d3a (marque)
const GAIN = rgb(0.13, 0.55, 0.24);
const DEPENSE = rgb(0.79, 0.15, 0.15);
const TEXTE = rgb(0.1, 0.11, 0.1);
const MUTED = rgb(0.42, 0.44, 0.42);
const TRAIT = rgb(0.85, 0.86, 0.84);
const FOND_EN_TETE = rgb(0.95, 0.96, 0.94);

// Géométrie A4 (points PDF).
const LARGEUR = 595.28;
const HAUTEUR = 841.89;
const MARGE = 48;
const BAS = 56; // marge basse avant saut de page

/** Données minimales nécessaires au PDF (communes à bilanAnnuel et bilanGlobal). */
export type DonneesBilanPdf = {
  gains: number;
  depenses: number;
  solde: number;
  parCategorie: { typeFlux: string; categorie: string; total: number }[];
};

export type MouvementPdf = {
  date: Date;
  typeFlux: string;
  categorie: string;
  montant: number;
  note: string | null;
};

/**
 * Nettoie une chaîne pour l'encodage WinAnsi de pdf-lib (polices standard) :
 * remplace les espaces insécables (dont l'espace fine U+202F qu'insère
 * `Intl.NumberFormat` avant le symbole monétaire) par une espace normale, puis
 * retire les caractères hors Latin-1 / WinAnsi (émojis d'une note libre, etc.).
 */
export function pdfSafe(s: string): string {
  // Jeu de caractères encodables par la police standard (WinAnsi) hors Latin-1.
  const WINANSI_HORS_LATIN1 = new Set([
    0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030,
    0x0160, 0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022,
    0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
  ]);
  let out = "";
  for (const ch of s.replace(/[\r\n\t]+/g, " ")) {
    const cp = ch.codePointAt(0)!;
    // Espaces insécables/fines (dont U+202F avant le symbole monétaire) → espace.
    if (cp === 0x00a0 || cp === 0x202f || cp === 0x2007 || cp === 0x2008 || cp === 0x2009) {
      out += " ";
    } else if ((cp >= 0x20 && cp <= 0xff) || WINANSI_HORS_LATIN1.has(cp)) {
      out += ch;
    }
    // sinon : caractère non encodable (émoji d'une note libre, etc.) → ignoré.
  }
  return out.trim();
}

/** Tronque un texte pour qu'il tienne dans `largeurMax` (ajoute « … »). */
function tronquer(
  texte: string,
  font: PDFFont,
  taille: number,
  largeurMax: number,
): string {
  if (font.widthOfTextAtSize(texte, taille) <= largeurMax) return texte;
  let t = texte;
  while (t.length > 1 && font.widthOfTextAtSize(t + "…", taille) > largeurMax) {
    t = t.slice(0, -1);
  }
  return t + "…";
}

/**
 * Construit le PDF du bilan comptable : totaux, répartition par catégorie et
 * journal des mouvements. pdf-lib embarque des polices standard (aucun accès
 * disque → sûr en serverless Vercel).
 */
export async function construireBilanPdf(
  bilan: DonneesBilanPdf,
  mouvements: MouvementPdf[],
  devise: string,
  libellePeriode: string,
): Promise<Uint8Array> {
  const fmt = (n: number) => pdfSafe(formatMontant(n, devise));

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const gras = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([LARGEUR, HAUTEUR]);
  let y = HAUTEUR - MARGE;

  // Ajoute une page et replace le curseur en haut (déclaration hoistée :
  // utilisée dans les sections « par catégorie » et « journal »).
  function nouvellePage() {
    page = doc.addPage([LARGEUR, HAUTEUR]);
    y = HAUTEUR - MARGE;
  }

  const texte = (
    s: string,
    x: number,
    yy: number,
    opts: { taille?: number; font?: PDFFont; couleur?: typeof TEXTE } = {},
  ) =>
    page.drawText(pdfSafe(s), {
      x,
      y: yy,
      size: opts.taille ?? 10,
      font: opts.font ?? font,
      color: opts.couleur ?? TEXTE,
    });

  // Texte aligné à droite sur `xDroite`.
  const texteDroite = (
    s: string,
    xDroite: number,
    yy: number,
    opts: { taille?: number; font?: PDFFont; couleur?: typeof TEXTE } = {},
  ) => {
    const safe = pdfSafe(s);
    const f = opts.font ?? font;
    const t = opts.taille ?? 10;
    page.drawText(safe, {
      x: xDroite - f.widthOfTextAtSize(safe, t),
      y: yy,
      size: t,
      font: f,
      color: opts.couleur ?? TEXTE,
    });
  };

  // -- En-tête ------------------------------------------------------------
  texte("Bilan comptable", MARGE, y, { taille: 22, font: gras, couleur: VERT });
  y -= 20;
  texte("Mon Troupeau", MARGE, y, { taille: 11, couleur: MUTED });
  texteDroite(libellePeriode, LARGEUR - MARGE, y + 6, {
    taille: 13,
    font: gras,
  });
  texteDroite(`Édité le ${formatDate(new Date())}`, LARGEUR - MARGE, y - 8, {
    taille: 9,
    couleur: MUTED,
  });
  y -= 24;
  page.drawLine({
    start: { x: MARGE, y },
    end: { x: LARGEUR - MARGE, y },
    thickness: 1,
    color: VERT,
  });
  y -= 28;

  // -- Totaux (3 cartes) --------------------------------------------------
  const totaux: { label: string; valeur: string; couleur: typeof TEXTE }[] = [
    { label: "Gains", valeur: fmt(bilan.gains), couleur: GAIN },
    { label: "Dépenses", valeur: fmt(bilan.depenses), couleur: DEPENSE },
    {
      label: "Solde",
      valeur: fmt(bilan.solde),
      couleur: bilan.solde >= 0 ? GAIN : DEPENSE,
    },
  ];
  const largeurCarte = (LARGEUR - 2 * MARGE - 2 * 12) / 3;
  const hauteurCarte = 56;
  totaux.forEach((t, i) => {
    const x = MARGE + i * (largeurCarte + 12);
    page.drawRectangle({
      x,
      y: y - hauteurCarte,
      width: largeurCarte,
      height: hauteurCarte,
      color: FOND_EN_TETE,
      borderColor: TRAIT,
      borderWidth: 1,
    });
    texte(t.label, x + 12, y - 20, { taille: 10, couleur: MUTED });
    texte(t.valeur, x + 12, y - 42, {
      taille: 16,
      font: gras,
      couleur: t.couleur,
    });
  });
  y -= hauteurCarte + 30;

  // -- Répartition par catégorie ------------------------------------------
  if (bilan.parCategorie.length > 0) {
    texte("Par catégorie", MARGE, y, { taille: 13, font: gras });
    y -= 18;
    for (const c of bilan.parCategorie) {
      if (y < BAS) nouvellePage();
      const estGain = c.typeFlux === "gain";
      texte(estGain ? "Gain" : "Dépense", MARGE, y, {
        taille: 9,
        couleur: estGain ? GAIN : DEPENSE,
        font: gras,
      });
      texte(c.categorie, MARGE + 60, y, { taille: 10 });
      texteDroite(fmt(c.total), LARGEUR - MARGE, y, {
        taille: 10,
        couleur: estGain ? GAIN : DEPENSE,
      });
      y -= 16;
      page.drawLine({
        start: { x: MARGE, y: y + 5 },
        end: { x: LARGEUR - MARGE, y: y + 5 },
        thickness: 0.5,
        color: TRAIT,
      });
    }
    y -= 18;
  }

  // -- Journal des mouvements ---------------------------------------------
  // Colonnes : Date | Type | Catégorie | Note | Montant (à droite).
  const COL_DATE = MARGE;
  const COL_TYPE = COL_DATE + 68;
  const COL_CAT = COL_TYPE + 54;
  const COL_NOTE = COL_CAT + 150;
  const COL_MONTANT_DROITE = LARGEUR - MARGE; // aligné à droite
  const LARGEUR_NOTE = COL_MONTANT_DROITE - 70 - COL_NOTE;

  // En-tête de colonnes du journal (répété en haut de chaque page).
  const enTeteColonnes = () => {
    page.drawRectangle({
      x: MARGE,
      y: y - 4,
      width: LARGEUR - 2 * MARGE,
      height: 18,
      color: FOND_EN_TETE,
    });
    const o = { taille: 9, font: gras, couleur: MUTED };
    texte("Date", COL_DATE + 4, y, o);
    texte("Type", COL_TYPE, y, o);
    texte("Catégorie", COL_CAT, y, o);
    texte("Note", COL_NOTE, y, o);
    texteDroite("Montant", COL_MONTANT_DROITE - 4, y, o);
    y -= 20;
  };

  texte("Journal des mouvements", MARGE, y, { taille: 13, font: gras });
  y -= 18;
  if (mouvements.length === 0) {
    texte("Aucun mouvement enregistré pour cette période.", MARGE, y, {
      taille: 10,
      couleur: MUTED,
    });
  } else {
    enTeteColonnes();
    for (const m of mouvements) {
      if (y < BAS) {
        nouvellePage();
        enTeteColonnes();
      }
      const estGain = m.typeFlux === "gain";
      texte(formatDate(m.date), COL_DATE + 4, y, { taille: 9 });
      texte(estGain ? "Gain" : "Dépense", COL_TYPE, y, {
        taille: 9,
        couleur: estGain ? GAIN : DEPENSE,
        font: gras,
      });
      texte(
        tronquer(pdfSafe(m.categorie), font, 9, COL_NOTE - COL_CAT - 6),
        COL_CAT,
        y,
        { taille: 9 },
      );
      if (m.note) {
        texte(tronquer(pdfSafe(m.note), font, 9, LARGEUR_NOTE), COL_NOTE, y, {
          taille: 9,
          couleur: MUTED,
        });
      }
      texteDroite(
        `${estGain ? "+" : "-"} ${fmt(m.montant)}`,
        COL_MONTANT_DROITE - 4,
        y,
        { taille: 9, font: gras, couleur: estGain ? GAIN : DEPENSE },
      );
      y -= 15;
      page.drawLine({
        start: { x: MARGE, y: y + 4 },
        end: { x: LARGEUR - MARGE, y: y + 4 },
        thickness: 0.5,
        color: TRAIT,
      });
    }
  }

  // -- Pied de page : numéro de page sur chaque page ----------------------
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawText(pdfSafe(`Page ${i + 1} / ${pages.length}`), {
      x: LARGEUR - MARGE - 60,
      y: 28,
      size: 8,
      font,
      color: MUTED,
    });
  });

  return doc.save();
}
