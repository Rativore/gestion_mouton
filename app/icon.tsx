import { ImageResponse } from "next/og";
import { SheepTile } from "@/components/icon-art";

// Deux tailles d'icône PNG : 192 et 512 (exigées par le manifest PWA).
export function generateImageMetadata() {
  return [
    { id: "192", size: { width: 192, height: 192 }, contentType: "image/png" },
    { id: "512", size: { width: 512, height: 512 }, contentType: "image/png" },
  ];
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const iconId = await id;
  const px = iconId === "512" ? 512 : 192;
  return new ImageResponse(<SheepTile />, { width: px, height: px });
}
