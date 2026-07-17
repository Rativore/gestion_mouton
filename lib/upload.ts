import { supabaseAdmin, BUCKET_PHOTOS } from "@/lib/supabase";

const EXTENSIONS_OK = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const TYPES_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

/**
 * Envoie une photo (issue d'un formulaire) vers Supabase Storage (bucket
 * public `animaux`) et renvoie son URL publique absolue, ou null si aucun
 * fichier. Le disque local n'est pas utilisé : Vercel a un système de fichiers
 * éphémère et en lecture seule en serverless.
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

  const nom = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_PHOTOS)
    .upload(nom, buffer, {
      contentType: TYPES_MIME[ext],
      upsert: false,
    });
  if (error) {
    throw new Error(`Échec de l'envoi de la photo : ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(BUCKET_PHOTOS).getPublicUrl(nom);
  return data.publicUrl;
}
