"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LIENS = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/troupeau", label: "Troupeau", icon: "🐑" },
  { href: "/comptabilite", label: "Compta", icon: "📊" },
  { href: "/ventes", label: "Achat/Vente", icon: "💶" },
  { href: "/reglages", label: "Réglages", icon: "⚙️" },
];

function estActif(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavDesktop() {
  const pathname = usePathname();
  return (
    <nav className="hidden gap-1 sm:flex">
      {LIENS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            estActif(pathname, l.href)
              ? "bg-primary text-white"
              : "text-muted hover:bg-border/60",
          )}
        >
          <span className="mr-1.5">{l.icon}</span>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export function NavMobile() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-surface sm:hidden">
      {LIENS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "flex flex-col items-center gap-0.5 py-2 text-[0.7rem] font-medium",
            estActif(pathname, l.href) ? "text-primary" : "text-muted",
          )}
        >
          <span className="text-lg">{l.icon}</span>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
