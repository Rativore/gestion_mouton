# 📚 Documentation — Mon Troupeau

Point d'entrée de la doc du projet. **À lire en premier pour reprendre rapidement.**

| Document | Contenu |
|---|---|
| `docs/README.md` (ce fichier) | Présentation, démarrage, pièges, état du projet |
| [`docs/ANALYSE.md`](./ANALYSE.md) | Analyse détaillée de la structure + plan de tâches vers la prod |

---

## 1. Présentation

Application de **gestion, traçabilité et comptabilité** d'un élevage de moutons / chèvres :
- **Troupeau** : fiche par animal (identité, filiation, santé, provenance, photo), onglets par espèce + « Vendus / Morts », liste triable.
- **Achat / Vente** : point de saisie unique. Achat = dépense (rouge), Vente = gain (vert). Un achat/vente d'animal crée/sort la bête ET le mouvement comptable lié. Historique chronologique coloré.
- **Comptabilité** : bilan par année (graphe mensuel) **ou toutes années confondues** (graphe par année) via le sélecteur, répartition par catégorie, journal des mouvements, **exports CSV et PDF**.
- **Réglages** : devise, espèces d'animaux, catégories de gains/dépenses.

Cible : **application mobile (PWA) simple, pour 2 utilisateurs** (l'éleveur et un proche). Pas d'objectif de montée en charge — un outil personnel pour simplifier le suivi.

---

## 2. Stack

**Next.js 16 (App Router) · React 19 · TypeScript · Prisma 6 · PostgreSQL (Supabase) · Tailwind 4.**
Server Components (lecture) + Server Actions (écriture).
Base hébergée sur **Supabase** (projet `dcomdmaaepacgbdqkdki`, région `eu-west-1`), déploiement visé sur **Vercel**.

---

## 3. Démarrage rapide

```bash
npm install
npm run dev        # http://localhost:3000
```

La base (`.env` → `DATABASE_URL` / `DIRECT_URL`) pointe sur **Supabase**. Le fichier `.env` n'est **pas** versionné : le récupérer/recréer avec les chaînes de connexion Supabase (onglet **Connect → ORMs → Prisma**).

Autres commandes utiles :
```bash
npm test                   # tests unitaires (node:test + tsx)
npx prisma studio          # explorer la base
npx prisma migrate dev     # créer/appliquer une migration
npm run build              # build de production
```

### ⚠️ Pièges d'environnement (à connaître)

1. **Node : utiliser la v24, pas la v12.** La machine a nvm avec **v12.13 liée par défaut** → `next dev` plante (`Unexpected token '?'`). Node 24 est dans `C:\Program Files\nodejs`.
   - Fix ponctuel : `$env:Path = "C:\Program Files\nodejs;" + $env:Path`
   - Fix permanent : `nvm unlink` puis rouvrir le terminal.

2. **Commandes Prisma en réseau Klesia** : l'inspection TLS bloque le téléchargement des binaires. Préfixer par :
   ```powershell
   $env:NODE_OPTIONS="--use-system-ca"; npx prisma migrate dev ...
   ```
   (Node 24 fait alors confiance au magasin de certificats Windows.)

3. **🔴 Le réseau Klesia bloque les ports PostgreSQL (5432/6543).** Impossible d'atteindre Supabase depuis le poste Klesia — ni pour migrer, ni pour faire tourner l'app en local. Contournements :
   - **Migrations** : appliquer le SQL via l'**éditeur SQL de Supabase** (HTTPS/443, non bloqué). Le SQL est dans `prisma/migrations/*/migration.sql`.
   - **Dev local** : utiliser un **réseau non filtré** (partage de connexion 4G, wifi perso).
   - **Usage réel** : **déployer sur Vercel** — l'app tourne dans le cloud (accès Supabase OK), on y accède en HTTPS depuis n'importe où. Voir le plan dans [`docs/ANALYSE.md`](./ANALYSE.md).

4. **OneDrive verrouille `.next`** : `npm run build` peut échouer avec `EPERM ... .next`. Arrêter le serveur avant, ou exclure `.next/` de la synchro OneDrive. Pour juste vérifier les types sans build : `npx tsc --noEmit`.

5. **Migration = serveur arrêté** : `prisma migrate`/`generate` échoue (`EPERM`) si un `next dev` tourne (moteur Prisma verrouillé). Arrêter le serveur, migrer, relancer.

---

## 4. Structure du projet

```
proxy.ts                Protection des routes (auth) — remplace middleware.ts (Next 16)
next.config.ts          Config (dont serverActions.bodySizeLimit pour l'upload photo)
app/
  page.tsx              Accueil (tableau de bord)
  loading.tsx           Squelette de chargement (idem par route ci-dessous)
  login/                Page de connexion
  troupeau/             Liste, fiche [id], édition, + naissance (+ loading.tsx)
  ventes/               Page « Achat / Vente » (saisie + historique)
  comptabilite/         Bilan + exports :
    export/route.ts       Export CSV
    export-pdf/route.ts   Export PDF (via lib/pdf-bilan)
  reglages/             Devise, espèces, catégories
  actions/*.ts          Server Actions (mutations) — chacune protégée par requireUser()
  manifest.ts, icon.tsx, apple-icon.tsx   PWA (manifest + icônes générées)
lib/
  services/*.ts         Accès données Prisma (animaux, ventes, comptabilite,
                        categories, especes, parametres)
  supabase/             Clients Supabase SSR : server.ts (cookies) + proxy.ts (session)
  constants.ts          Constantes métier (espèces défaut, catégories, devises…)
  utils.ts              Formatage (montant, symbole devise, date, âge, tri)
  validation.ts         Schémas Zod + helper valider() ; type EtatFormulaire
  use-formulaire.ts     Hook des petits formulaires (useActionState + reset)
  pdf-bilan.ts          Génération du PDF du bilan (pdf-lib)
  auth.ts               requireUser() (garde des Server Actions)
  prisma.ts             Client Prisma singleton
  upload.ts             Upload des photos vers Supabase Storage (bucket animaux)
  supabase.ts           Client Supabase à clé secrète (server-only)
components/*.tsx         UI (ui.tsx, nav, formulaires, champ-photo, skeletons…)
test/*.test.ts          Tests unitaires (node:test + tsx) : bilans, utils, validation, pdf
prisma/
  schema.prisma         Modèle de données
  migrations/           Migrations versionnées
  seed.mjs              Données de démo
docs/                   Cette documentation
```

**Conventions** :
- Lecture dans les Server Components via `lib/services` ; écriture via `app/actions` puis `revalidatePath`.
- Valeurs par défaut (espèces, catégories) en code ; personnalisations en base — fusionnées à l'affichage.
- Montants formatés via `formatMontant(n, devise)` (2 décimales) ; symbole via `symboleDevise(devise)` ; devise lue par `getDevise()`.
- Le calcul des bilans est **séparé du fetch** (`calculerBilanAnnuel/Global` purs) → testable sans base.
- Photos **compressées côté navigateur** avant l'upload (`components/champ-photo.tsx`).

---

## 5. État du projet

**App en ligne et utilisée au quotidien** ✅ — https://gestion-mouton.vercel.app

Phases A→E **terminées** (bascule Supabase, photos sur Storage, PWA installable, auth 2 comptes, déploiement Vercel). Détails et journal complet dans [`docs/ANALYSE.md`](./ANALYSE.md).

**Phase F (finitions & robustesse) — bien avancée** ✅ :
- Sécurité : `requireUser()` dans chaque action, recherche insensible à la casse, suppression d'un animal vendu sécurisée.
- Compta : montants **`Float → Decimal`** (2 décimales à l'affichage), **export CSV** et **export PDF**, date/motif de décès.
- Qualité : validation **Zod**, factorisation (agrégations, hook `useFormulaire`), **tests** (`npm test`, 20 tests).
- Mobile : `inputMode` numérique, champs 16px (stop zoom iOS), **safe-area**, onglets scrollables, montants adaptatifs, **compression photo** avant upload.
- Fluidité : **écrans de chargement** (`loading.tsx`) + proxy auth **local** (`getClaims`, plus d'appel réseau par navigation).
- Devise suivie partout (plus de « € » codé en dur).

**Reste (non urgent, quand l'envie vient)** :
- Tableau de bord enrichi.
- Passe **esthétique** mobile optionnelle (listes en cartes, refonte visuelle).
- Tests d'intégration DB (chemins transactionnels).
- Recette PWA « Ajouter à l'écran d'accueil » sur mobile (à confirmer par l'utilisateur).
