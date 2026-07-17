import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppChrome } from "@/components/app-chrome";
import { PwaRegister } from "@/components/pwa-register";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Mon Troupeau",
  title: "Mon Troupeau",
  description:
    "Gestion, traçabilité et comptabilité de mon troupeau de moutons et chèvres.",
  // Comportement « app » une fois ajoutée à l'écran d'accueil iOS.
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Troupeau",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  // Couleur de la barre du navigateur, adaptée au thème clair / sombre.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3f7d3a" },
    { media: "(prefers-color-scheme: dark)", color: "#1d2118" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppChrome>{children}</AppChrome>
        <PwaRegister />
      </body>
    </html>
  );
}
