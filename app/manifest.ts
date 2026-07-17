import type { MetadataRoute } from "next";

// Manifest PWA : rend l'app installable sur l'écran d'accueil (mode standalone,
// sans barre d'adresse). Les icônes proviennent de `app/icon.tsx`.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mon Troupeau",
    short_name: "Troupeau",
    description:
      "Gestion, traçabilité et comptabilité de mon troupeau de moutons et chèvres.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f7f4",
    theme_color: "#3f7d3a",
    lang: "fr",
    icons: [
      {
        src: "/icon/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
