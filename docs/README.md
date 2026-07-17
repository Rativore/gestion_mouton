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
- **Comptabilité** : bilan par année (graphe mensuel) **ou toutes années confondues** (graphe par année) via le sélecteur, répartition par catégorie, journal des mouvements.
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
app/
  page.tsx              Accueil (tableau de bord)
  troupeau/             Liste, fiche [id], édition, + naissance
  ventes/               Page « Achat / Vente » (saisie + historique)
  comptabilite/         Bilan annuel/mensuel (lecture seule)
  reglages/             Devise, espèces, catégories
  actions/*.ts          Server Actions (mutations)
lib/
  services/*.ts         Accès données Prisma (animaux, ventes, comptabilite,
                        categories, especes, parametres)
  constants.ts          Constantes métier (espèces défaut, catégories, devises…)
  utils.ts              Formatage (montant, date, âge)
  prisma.ts             Client Prisma singleton
  upload.ts             Upload des photos vers Supabase Storage (bucket animaux)
  supabase.ts           Client Supabase à clé secrète (server-only)
components/*.tsx         UI (formulaires, nav, cartes, boutons…)
prisma/
  schema.prisma         Modèle de données
  migrations/           Migrations versionnées
  seed.mjs              Données de démo
docs/                   Cette documentation
```

**Conventions** :
- Lecture dans les Server Components via `lib/services` ; écriture via `app/actions` puis `revalidatePath`.
- Valeurs par défaut (espèces, catégories) en code ; personnalisations en base — fusionnées à l'affichage.
- Montants formatés via `formatMontant(n, devise)` ; devise lue par `getDevise()`.

---

## 5. État du projet

**V1 fonctionnelle** ✅ — toutes les fonctionnalités ci-dessus marchent.
**Base migrée sur PostgreSQL / Supabase** ✅ — schéma appliqué, tables créées (vides).
**Phase A terminée** ✅ — `.env` basculé sur Supabase, migration baselinée, connexion app validée (lectures + écriture) depuis le réseau perso.
**Phase B terminée** ✅ — photos uploadées vers **Supabase Storage** (bucket `animaux`), disque local abandonné → dernier verrou avant Vercel levé.

**Prochaines étapes** → plan détaillé dans [`docs/ANALYSE.md`](./ANALYSE.md). Résumé de la route vers l'usage mobile :
1. ~~**Phase A** — finaliser la bascule Supabase~~ ✅ **faite**.
2. ~~**Phase B** — photos → Supabase Storage~~ ✅ **faite**.
3. **Phase C** 🎯 — **PWA** (installable sur téléphone, effet « app »).
4. **Phase D** — **authentification 2 comptes** (Supabase Auth).
5. **Phase E** — **déploiement Vercel**.
6. **Phases F+** — finitions mobile, `Float → Decimal`, exports, tests.

**Points d'attention connus** (détaillés dans ANALYSE.md) :
- ✅ ~~Photos sur disque local~~ → **Supabase Storage** (fait, verrou Vercel levé).
- 🟠 Montants en `Float` → passer en `Decimal` avant compta « sérieuse ».
- 🟡 Recherche sensible à la casse sur Postgres ; suppression d'un animal vendu à sécuriser.
