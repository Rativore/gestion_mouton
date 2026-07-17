import { ImageResponse } from "next/og";
import { SheepTile } from "@/components/icon-art";

// Icône « ajouter à l'écran d'accueil » iOS. Fond plein (iOS masque lui-même
// les coins), taille recommandée 180×180.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<SheepTile />, { ...size });
}
