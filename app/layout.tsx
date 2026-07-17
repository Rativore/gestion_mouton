import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { NavDesktop, NavMobile } from "@/components/nav";
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
        <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="text-xl">🐑</span>
              <span>Mon Troupeau</span>
            </Link>
            <NavDesktop />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 sm:pb-6">
          {children}
        </main>

        <NavMobile />
        <PwaRegister />
      </body>
    </html>
  );
}
