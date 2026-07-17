import Link from "next/link";
import {
  listerAnimaux,
  compterAnimaux,
  type FiltreAnimaux,
} from "@/lib/services/animaux";
import { listerEspeces, libelleEspece } from "@/lib/services/especes";
import { PageHeader, Badge, EmptyState, LinkButton } from "@/components/ui";
import { SEXES, STATUTS, labelDe, emojiEspece } from "@/lib/constants";
import { calculerAge, cn, lienTri, flecheTri } from "@/lib/utils";

type Tri = "numero" | "age" | "sexe";
const ONGLET_SORTIS = "sortis";

export default async function TroupeauPage({
  searchParams,
}: {
  searchParams: Promise<{
    onglet?: string;
    recherche?: string;
    tri?: string;
    ordre?: string;
  }>;
}) {
  const sp = await searchParams;
  const recherche = sp.recherche || undefined;

  const [especes, compteurs] = await Promise.all([
    listerEspeces(),
    compterAnimaux(),
  ]);

  // Onglet valide : une espèce existante, ou "sortis" ; défaut = 1re espèce.
  const ongletsValides = [...especes.map((e) => e.value), ONGLET_SORTIS];
  const onglet =
    sp.onglet && ongletsValides.includes(sp.onglet)
      ? sp.onglet
      : (especes[0]?.value ?? ONGLET_SORTIS);

  // Onglet -> filtre : une espèce = présents de l'espèce ; Sortis = vendus + morts.
  const filtre: FiltreAnimaux = { recherche };
  if (onglet === ONGLET_SORTIS) {
    filtre.statuts = ["vendu", "mort"];
  } else {
    filtre.espece = onglet;
    filtre.statut = "present";
  }

  const animaux = await listerAnimaux(filtre);

  // Tri (par âge par défaut).
  const tri: Tri = sp.tri === "numero" || sp.tri === "sexe" ? sp.tri : "age";
  const ordre = sp.ordre === "desc" ? "desc" : "asc";
  const sens = ordre === "asc" ? 1 : -1;

  const tries = [...animaux].sort((a, b) => {
    if (tri === "numero") {
      return a.numero.localeCompare(b.numero, "fr", { numeric: true }) * sens;
    }
    if (tri === "sexe") {
      return (a.sexe ?? "").localeCompare(b.sexe ?? "", "fr") * sens;
    }
    const da = a.dateNaissance ? new Date(a.dateNaissance).getTime() : null;
    const db = b.dateNaissance ? new Date(b.dateNaissance).getTime() : null;
    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;
    // Âge croissant = du plus jeune au plus vieux (date la plus récente d'abord).
    return (db - da) * sens;
  });

  // Liens conservant l'onglet, la recherche et le tri courants.
  const hrefOnglet = (o: string) => {
    const p = new URLSearchParams();
    p.set("onglet", o);
    if (recherche) p.set("recherche", recherche);
    return `/troupeau?${p.toString()}`;
  };
  const paramsTri = { onglet, ...(recherche ? { recherche } : {}) };
  const hrefTri = (col: Tri) =>
    lienTri("/troupeau", paramsTri, col, tri, ordre, "asc");
  const fleche = (col: Tri) => flecheTri(col, tri, ordre);

  // La colonne Statut n'a de sens que pour les bêtes sorties du troupeau.
  const montrerStatut = onglet === ONGLET_SORTIS;
  const gridCls = montrerStatut
    ? "grid-cols-[2fr_1fr_1fr_auto]"
    : "grid-cols-[2fr_1fr_1fr]";

  const onglets: { key: string; label: string; count: number }[] = [
    ...especes.map((e) => ({
      key: e.value,
      label: `${emojiEspece(e.value)} ${e.label}`,
      count: compteurs.parEspece[e.value] ?? 0,
    })),
    { key: ONGLET_SORTIS, label: "Vendus / Morts", count: compteurs.sortis },
  ];

  return (
    <>
      <PageHeader
        titre="Troupeau"
        action={
          <LinkButton href="/troupeau/nouveau">+ Naissance</LinkButton>
        }
      />

      {/* Onglets par espèce + sortis */}
      <div className="mb-4 flex gap-1 border-b border-border">
        {onglets.map((o) => (
          <Link
            key={o.key}
            href={hrefOnglet(o.key)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              onglet === o.key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {o.label}
            <span className="ml-1.5 text-xs font-normal text-muted">
              ({o.count})
            </span>
          </Link>
        ))}
      </div>

      {/* Recherche (type Ctrl+F) */}
      <form method="get" className="mb-6 flex items-center gap-2">
        <input type="hidden" name="onglet" value={onglet} />
        <input type="hidden" name="tri" value={tri} />
        <input type="hidden" name="ordre" value={ordre} />
        <input
          name="recherche"
          defaultValue={sp.recherche ?? ""}
          placeholder="Rechercher un numéro, une race, une note…"
          className="field"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Rechercher
        </button>
        {recherche && (
          <Link
            href={hrefOnglet(onglet)}
            className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-border/50"
          >
            Effacer
          </Link>
        )}
      </form>

      {tries.length === 0 ? (
        <EmptyState
          titre={
            onglet === "sortis"
              ? "Aucun animal vendu ou mort"
              : recherche
                ? "Aucun résultat"
                : "Aucun animal"
          }
          description={
            onglet === "sortis"
              ? "Les bêtes vendues ou décédées apparaîtront ici."
              : "Ajoutez une naissance ici, ou un achat depuis « Achat / Vente »."
          }
          action={
            onglet !== "sortis" && !recherche ? (
              <LinkButton href="/troupeau/nouveau">+ Naissance</LinkButton>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div
            className={cn(
              "grid gap-3 border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted",
              gridCls,
            )}
          >
            <Link href={hrefTri("numero")} className="hover:text-foreground">
              Numéro / Race{fleche("numero")}
            </Link>
            <Link href={hrefTri("age")} className="hover:text-foreground">
              Âge{fleche("age")}
            </Link>
            <Link href={hrefTri("sexe")} className="hover:text-foreground">
              Sexe{fleche("sexe")}
            </Link>
            {montrerStatut && <span className="justify-self-end">Statut</span>}
          </div>
          <div className="divide-y divide-border">
            {tries.map((a) => (
              <Link
                key={a.id}
                href={`/troupeau/${a.id}`}
                className={cn(
                  "grid items-center gap-3 px-4 py-3 transition-colors hover:bg-border/40",
                  gridCls,
                )}
              >
                <div className="min-w-0">
                  <span className="font-semibold">n°{a.numero}</span>
                  <span className="ml-2 truncate text-sm text-muted">
                    {a.race ?? libelleEspece(especes, a.espece)}
                  </span>
                </div>
                <span className="text-sm text-muted">
                  {calculerAge(a.dateNaissance)}
                </span>
                <span className="text-sm text-muted">
                  {labelDe(SEXES, a.sexe)}
                </span>
                {montrerStatut && (
                  <span className="justify-self-end">
                    <Badge tone={a.statut as "present" | "vendu" | "mort"}>
                      {labelDe(STATUTS, a.statut)}
                    </Badge>
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
