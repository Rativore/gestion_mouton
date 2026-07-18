import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Les Server Actions sont plafonnées à 1 Mo par défaut : trop peu pour une
      // photo. Les images sont désormais compressées côté navigateur (voir
      // components/champ-photo.tsx) et pèsent quelques centaines de Ko ; ce
      // plafond reste un filet de sécurité, sous la limite plateforme Vercel
      // (~4,5 Mo pour le corps d'une fonction serverless).
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
