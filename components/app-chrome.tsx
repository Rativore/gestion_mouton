"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavDesktop, NavMobile } from "@/components/nav";
import { deconnexionAction } from "@/app/actions/auth";

/**
 * Habillage de l'app (en-tête + navigation). Masqué sur /login pour présenter
 * une page de connexion épurée. Contient le bouton de déconnexion.
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-6">
        {children}
      </main>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="text-xl">🐑</span>
            <span>Mon Troupeau</span>
          </Link>
          <div className="flex items-center gap-2">
            <NavDesktop />
            <form action={deconnexionAction}>
              <button
                type="submit"
                title="Déconnexion"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-border/60"
              >
                <span className="sm:hidden">⎋</span>
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-6">
        {children}
      </main>

      <NavMobile />
    </>
  );
}
