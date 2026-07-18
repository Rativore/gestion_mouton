"use client";

import { useRef, useState, type ChangeEvent } from "react";

// Redimensionne côté navigateur avant l'envoi : les photos d'iPhone (3–5 Mo)
// dépassent la limite de corps des Server Actions et la limite de Vercel.
// On plafonne la plus grande dimension et on ré-encode en JPEG → typiquement
// quelques centaines de Ko, ce qui allège aussi le stockage Supabase.
const MAX_DIM = 1600;
const QUALITE = 0.82;

async function compresser(file: File): Promise<File> {
  // Les GIF (potentiellement animés) et non-images passent tels quels.
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image", // respecte l'orientation EXIF (photos iPhone)
    });
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    // Déjà petite et sans redimensionnement utile : on garde l'original.
    if (scale === 1 && file.size < 1_000_000) {
      bitmap.close?.();
      return file;
    }
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", QUALITE),
    );
    if (!blob || blob.size >= file.size) return file; // aucun gain → original
    const nom = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nom, { type: "image/jpeg" });
  } catch {
    return file; // en cas d'échec, on laisse l'original (filet : bodySizeLimit)
  }
}

/**
 * Champ de sélection de photo qui compresse l'image dans le navigateur avant
 * l'envoi du formulaire. Remplace le fichier sélectionné dans l'input par sa
 * version optimisée, de sorte que la soumission normale du formulaire (Server
 * Action) transporte le fichier allégé.
 */
export function ChampPhoto({
  id = "photo",
  name = "photo",
}: {
  id?: string;
  name?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [etat, setEtat] = useState<"vide" | "encours" | "pret">("vide");
  const [taille, setTaille] = useState("");

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setEtat("vide");
      return;
    }
    setEtat("encours");
    const optimise = await compresser(file);
    // Remplace le fichier de l'input par la version compressée (n'émet pas de
    // nouvel évènement change → pas de boucle).
    if (optimise !== file && ref.current) {
      const dt = new DataTransfer();
      dt.items.add(optimise);
      ref.current.files = dt.files;
    }
    setTaille(`${Math.round(optimise.size / 1024)} Ko`);
    setEtat("pret");
  }

  return (
    <>
      <input
        ref={ref}
        id={id}
        name={name}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="field"
      />
      {etat === "encours" && (
        <p className="mt-1 text-xs text-muted">Optimisation de l&apos;image…</p>
      )}
      {etat === "pret" && (
        <p className="mt-1 text-xs text-muted">Image prête ({taille}).</p>
      )}
    </>
  );
}
