import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DOSSIER_UPLOAD = path.join(process.cwd(), "public", "uploads");
const EXTENSIONS_OK = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

/**
 * Enregistre une photo envoyée via un formulaire dans public/uploads et
 * renvoie le chemin public (ex: /uploads/xxx.jpg), ou null si aucun fichier.
 */
export async function enregistrerPhoto(
  fichier: FormDataEntryValue | null,
): Promise<string | null> {
  if (!fichier || typeof fichier === "string") return null;
  const file = fichier as File;
  if (file.size === 0) return null;

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!EXTENSIONS_OK.has(ext)) {
    throw new Error("Format d'image non supporté (jpg, png, webp, gif).");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image trop lourde (8 Mo maximum).");
  }

  await mkdir(DOSSIER_UPLOAD, { recursive: true });
  const nom = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(DOSSIER_UPLOAD, nom), buffer);
  return `/uploads/${nom}`;
}
