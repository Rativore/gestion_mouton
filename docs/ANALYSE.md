# Analyse de la structure & plan produit

_Projet : **Mon Troupeau** — gestion / traçabilité / comptabilité d'un élevage._
_Cible : **application mobile (PWA), simple, pour 2 utilisateurs.** Pas d'objectif de montée en charge._
_Objectif du document : évaluer l'état du code et définir le chemin vers une app mobile utilisable au quotidien, hébergée sur Vercel + Supabase._

---

## 1. Architecture actuelle

Stack : **Next.js 16 (App Router) · React 19 · TypeScript · Prisma 6 · PostgreSQL (Supabase) · Tailwind 4**.

```
┌─────────────────────────────────────────────────────────┐
│  app/**/page.tsx        Server Components (lecture)       │
│  app/actions/*.ts       Server Actions (écriture)         │
│  components/*.tsx        UI (client + serveur)            │
├─────────────────────────────────────────────────────────┤
│  lib/services/*.ts      Accès données (Prisma) par domaine│
│  lib/{constants,utils}  Constantes métier & formatage     │
│  lib/prisma.ts          Client Prisma (singleton)         │
├─────────────────────────────────────────────────────────┤
│  prisma/schema.prisma   Modèle + migrations versionnées   │
│  PostgreSQL — Supabase (projet dcomdmaaepacgbdqkdki)      │
└─────────────────────────────────────────────────────────┘
```

> **Réseau Klesia** : les ports PostgreSQL (5432/6543) sont bloqués par le pare-feu.
> L'app ne peut donc pas joindre Supabase depuis le poste Klesia. Cible d'exécution =
> **Vercel** (cloud → Supabase OK, accès navigateur en HTTPS). Dev local = réseau non filtré.

**Flux** : la page (Server Component) lit via `lib/services` → rend le HTML ; les formulaires appellent une Server Action → service → `revalidatePath`.

### Modèle de données
| Table | Rôle | Relations |
|---|---|---|
| `Animal` | bête du troupeau | mère/père (auto-réf.), santé, vente, dépense d'achat |
| `EvenementSante` | suivi santé | → Animal (cascade) |
| `Vente` | traçabilité vente | → Animal, → MouvementComptable (gain) |
| `MouvementComptable` | gain / dépense | ← Vente, ← Animal (achat) |
| `Parametre` | réglages clé/valeur (devise) | — |
| `Espece` | espèces personnalisées | — |
| `Categorie` | catégories personnalisées | — |

---

## 2. Points forts ✅

- **Séparation des responsabilités claire** : données (`services`) / mutations (`actions`) / UI (`components`). Facile à faire évoluer.
- **Patterns Next.js idiomatiques** : Server Components + Server Actions, pas de couche API redondante.
- **Transactions** là où l'intégrité l'exige : vente et achat créent/suppriment atomiquement l'animal + le mouvement comptable lié.
- **Anti-doublon** : ventes/achats d'animaux passent par un seul chemin ; catégories dédiées verrouillées.
- **Extensibilité** : pattern « valeurs par défaut en code + personnalisées en base » (espèces, catégories).
- **Migrations versionnées** et schéma commenté.
- Aucune requête N+1 : agrégations (`groupBy`), `include` maîtrisés.

---

## 3. Points faibles & risques ⚠️

Classés par sévérité. Références fichier entre parenthèses.

### 🔴 Bloquant pour le déploiement Vercel (à traiter en priorité)
- **Stockage photos sur disque local** (`lib/upload.ts` → `public/uploads/`). Le système de fichiers de Vercel est **éphémère** : les photos seraient perdues à chaque redéploiement, et l'écriture y est de toute façon interdite en serverless. → **Supabase Storage** (bucket dédié, upload en HTTPS). C'est le chantier n°1 (Phase B).

### 🟠 Requis avant la mise en ligne
- **Aucune authentification.** Acceptable en local, requis dès que l'app est publique. Pour 2 utilisateurs : **Supabase Auth** (email/mot de passe), 2 comptes, données partagées (pas de multi-tenant). → Phase D.
- **Secrets & env** : `.env` n'est pas versionné (OK). En prod, `DATABASE_URL`/`DIRECT_URL` (+ clés Supabase) passent par les variables d'environnement Vercel.
- **Montants en `Float`** (`schema.prisma` : `coutAchat`, `prix`, `prixAuKilo`, `marge`, `montant`). La virgule flottante provoque des erreurs d'arrondi (`0.1+0.2≠0.3`). Tolérable pour un suivi simple, mais à passer en **`Decimal`** avant de s'appuyer sur les chiffres pour une compta « sérieuse ». → Phase F.

### 🟡 À corriger (fiabilité)
- **Recherche sensible à la casse sur PostgreSQL** (`lib/services/animaux.ts:18-24`, `contains`). SQLite était insensible par défaut, Postgres non. → ajouter `mode: "insensitive"`.
- **Suppression d'un animal déjà vendu** : `Vente.animal` n'a pas de règle `onDelete`. Supprimer une bête vendue échouera (violation de clé étrangère). → définir un comportement explicite (interdire, ou cascader vers la vente).
- **Gestion d'erreurs générique** (`app/actions/*.ts` : `catch {}`) : messages peu précis pour l'utilisateur.

### ⚪ Améliorations (qualité)
- **Validation** : entrées des Server Actions validées à la main → introduire **Zod** (schémas réutilisables, messages clairs).
- **Tests** absents : cibler la logique critique (vente, achat, `bilanAnnuel`).
- **Énumérations en `String`** (statut, sexe, typeFlux…) : envisager des enums Prisma natifs sur Postgres.
- Quelques modèles sans `updatedAt` (`Vente`, `MouvementComptable`).

---

## 4. Plan de tâches — vers l'app mobile

Effort indicatif : **S** = < ½ j · **M** = ½–1 j · **L** = 1–3 j.
Objectif : une **PWA** installable sur téléphone, pour **2 utilisateurs**, hébergée sur **Vercel + Supabase**. On vise le simple et le robuste, pas la scalabilité.

### Phase A — Finaliser la bascule Supabase ✅ _(terminée le 17/07 depuis le réseau perso)_
- [x] Schéma Prisma → `provider = "postgresql"` + `directUrl` — **S**
- [x] `.env` avec les connexions Supabase (pooler 6543 + directe 5432) — **S**
- [x] Générer la migration initiale PostgreSQL (`prisma/migrations/*/migration.sql`) — **S**
- [x] Créer les tables sur Supabase (via l'éditeur SQL, contournement du pare-feu Klesia) — **S**
- [x] **Baseliner l'historique de migration** : `prisma migrate resolve --applied 20260717000000_init` → « Database schema is up to date! » — **S**
- [x] **Tester la connexion de l'app** : `npm run dev` OK, pages `/ /troupeau /comptabilite /ventes` en 200, écriture Supabase validée (create/count/delete d'un animal de test) — **S**

### Phase B — Photos sur Supabase Storage ✅ _(terminée le 17/07)_
- [x] Créer un **bucket** Supabase Storage `animaux` (lecture publique) — **S**
- [x] Réécrire `lib/upload.ts` : upload vers Storage via `@supabase/supabase-js`, renvoie l'URL publique. Nouveau module `lib/supabase.ts` (`server-only` + client clé secrète). — **M**
- [x] `components/animal-photo.tsx` : aucun changement nécessaire (utilise déjà un `<img src>` brut, pas `next/image`) — l'URL absolue Supabase fonctionne telle quelle — **S**
- [x] Rien à migrer : base Supabase **vide**, on repart de zéro. Orphelins de test locaux (`public/uploads/*.webp`) supprimés — **S**
- [x] `lib/upload.ts` n'écrit plus sur disque ; `public/uploads/` sort du flux (dossier conservé vide avec `.gitkeep`) — **S**

> **Validation** : `tsc --noEmit` OK ; test Storage de bout en bout (upload clé secrète → URL publique → lecture HTTP 200 `image/png` → suppression) ; pages `/troupeau/nouveau` et compagnie en 200 (la chaîne action → upload → client Supabase s'initialise sans erreur).
> **Clés `.env`** : `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (public), `SUPABASE_SECRET_KEY` (serveur uniquement — jamais exposée au navigateur).

### Phase C — PWA (effet « app mobile »)
- [ ] `app/manifest.ts` (ou `public/manifest.json`) : nom, `display: standalone`, couleurs, orientation — **S**
- [ ] Icônes **192×192** et **512×512** (+ `apple-touch-icon`) — **S**
- [ ] Service worker minimal pour l'installabilité (`next-pwa` ou implémentation manuelle) — **M**
- [ ] Balises `<meta viewport>` / theme-color, test « Ajouter à l'écran d'accueil » sur iOS + Android — **S**

### Phase D — Authentification 2 comptes (Supabase Auth)
- [ ] Activer **Supabase Auth** (email/mot de passe), créer les 2 comptes — **S**
- [ ] Intégrer `@supabase/ssr` : login, session, `middleware.ts` protégeant toutes les routes — **M**
- [ ] Page de connexion simple + déconnexion — **S**
- [ ] (Données **partagées** entre les 2 comptes — pas de séparation par utilisateur) — **—**

### Phase E — Déploiement Vercel
- [ ] Brancher le repo GitHub `Rativore/gestion_mouton` sur Vercel — **S**
- [ ] Variables d'environnement Vercel : `DATABASE_URL`, `DIRECT_URL` (+ clés Supabase) — **S**
- [ ] Vérifier le **build** (`prisma generate` au build, `postinstall` si besoin) — **S**
- [ ] Recette sur URL de prod depuis un téléphone — **S**

### Phase F — Finitions & robustesse (en continu, après mise en ligne)
- [ ] **Mobile-first** : passe sur les formulaires et la nav au pouce (tailles de cible, claviers adaptés) — **M**
- [ ] Montants **`Float → Decimal`** (schéma + services + formatage) avant compta « sérieuse » — **M**
- [ ] Recherche `mode: "insensitive"` ; sécuriser la suppression d'un animal vendu — **S**
- [ ] **Zod** sur les Server Actions + messages d'erreur clairs — **M**
- [ ] Export comptable (CSV / PDF), tableau de bord enrichi, date/motif de décès — **M**
- [ ] **Factoriser la duplication restante** (repérée au tri du 17/07, laissée car non testable hors ligne) : helper de formatage `fmt` (répété dans 4 pages), helpers de tri `hrefTri`/`fleche` (`troupeau` + `ventes`), boucles d'agrégation quasi identiques `bilanAnnuel`/`bilanGlobal`, type `EtatFormulaire` redéclaré dans les 6 actions, échafaudage `useActionState`/`useRef` des petits formulaires — **M**

---

## 5. Ordre recommandé

**Phase A** (finir Supabase) → **Phase B** (photos, *le* prérequis technique pour Vercel) → **Phase C** (PWA, effet immédiat) → **Phase D** (auth) → **Phase E** (déploiement). La **Phase F** se traite en continu une fois l'app en ligne.

> Jalons clés : **B** débloque le déploiement (sans stockage objet, pas de Vercel), **E** rend l'app réellement utilisable au quotidien depuis le téléphone. Le passage **`Decimal`** (F) n'est pas bloquant pour un usage simple mais reste recommandé avant de se fier aux chiffres comptables.

---

## 6. Journal des évolutions

### 2026-07-17 (réseau perso) — Phase B terminée : photos sur Supabase Storage
- **🖼️ Upload photos migré vers Supabase Storage.** Bucket public `animaux` créé. `lib/upload.ts` réécrit : n'écrit plus sur disque (`public/uploads/`), envoie le fichier au bucket via `@supabase/supabase-js` et renvoie l'URL publique absolue. Nouveau module `lib/supabase.ts` : client à clé secrète, protégé par `server-only` (jamais côté navigateur).
- **🔑 Nouvelles clés `.env`** : `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (publique), `SUPABASE_SECRET_KEY` (serveur uniquement). Nouvelles deps : `@supabase/supabase-js`, `server-only`.
- **✅ Validé** : `tsc --noEmit` OK ; test Storage complet (upload → URL publique → lecture HTTP 200 → suppression) ; pages 200. `components/animal-photo.tsx` inchangé (l'`<img src>` accepte l'URL absolue).
- **🧹** Orphelins de test `public/uploads/*.webp` (base vide) supprimés ; dossier conservé vide avec `.gitkeep`.
- **➡️ Suite.** Le dernier verrou technique du déploiement Vercel est levé. Prochain jalon : **Phase C — PWA**.

### 2026-07-17 (réseau perso) — Phase A terminée : app connectée à Supabase
- **🔌 `.env` basculé sur Supabase.** Il pointait encore sur l'ancienne base SQLite (`file:./dev.db`) : remplacé par `DATABASE_URL` (pooler 6543, `pgbouncer=true`) et `DIRECT_URL` (direct 5432). `.env` confirmé ignoré par git.
- **✅ Migration baselinée.** `prisma generate` OK, puis `prisma migrate resolve --applied 20260717000000_init` (les 7 tables existaient déjà, créées via l'éditeur SQL) → `migrate status` = « Database schema is up to date! ».
- **✅ Connexion validée de bout en bout.** `npm run dev` démarre, `/ /troupeau /comptabilite /ventes` répondent en 200 (lectures via le pooler), et une écriture test (create → count → delete d'un `Animal`) a bien commit sur Supabase.
- **➡️ Suite.** Phase A close. Prochain jalon : **Phase B — photos sur Supabase Storage** (prérequis technique du déploiement Vercel).

### 2026-07-17 (soir) — Migration SQLite → PostgreSQL (Supabase)
- **🗄️ Bascule de la base sur Supabase.** `schema.prisma` passe en `provider = "postgresql"` avec `directUrl` (migrations sur le port direct 5432, requêtes applicatives sur le pooler 6543). `.env` (non versionné) contient `DATABASE_URL` (pooler, `pgbouncer=true`) et `DIRECT_URL` (direct). Anciennes migrations SQLite supprimées, **migration initiale PostgreSQL** régénérée (`prisma migrate diff`) dans `prisma/migrations/20260717000000_init/`.
- **🚧 Contournement pare-feu Klesia.** Les ports Postgres (5432/6543) sont bloqués sur le réseau Klesia (`TcpTestSucceeded: False`) → `prisma migrate` échoue en `P1001`. Les tables ont donc été créées **via l'éditeur SQL de Supabase** (HTTPS/443). Base **vide** (aucun mouton, aucune dépense — volonté de l'utilisateur, il saisira lui-même).
- **➡️ Conséquence.** L'app ne peut pas tourner depuis le poste Klesia (même blocage réseau). Cible d'exécution = **Vercel** ; dev local = réseau non filtré. Reste à baseliner l'historique de migration (`migrate resolve`) depuis un réseau qui atteint Supabase.
- **🎯 Réorientation produit.** Cible clarifiée : **PWA mobile pour 2 utilisateurs**, simple, sans montée en charge. Plan de tâches (§4) réécrit en conséquence : photos → Supabase Storage, PWA, auth 2 comptes, déploiement Vercel.
- **🧹 Tri du code (sans changement de comportement).** Retrait de code mort (`creerMouvementAction` inutilisée + ses imports dans `app/actions/comptabilite.ts`, constante `TYPES_FLUX`), constante `PERE_EXTERIEUR` hoistée dans `lib/constants.ts` (était dupliquée en dur entre `animal-form` et l'action), 2 corrections de texte (« Type d'vente » → « Type de vente » ; empty-state compta « Gains / Dépenses » → « Achat / Vente »), et remplacement du `README.md` racine (boilerplate `create-next-app`) par un vrai README pointant vers `docs/`. La duplication plus lourde est laissée et tracée en Phase F.

### 2026-07-17
- **🐛 Correctif — date d'achat basculant dans le mois en cours.** `reconcilierAchat` (`lib/services/animaux.ts`) utilisait `d.dateEntree ?? new Date()` : dès que la date d'entrée était vide à l'enregistrement (typiquement en modifiant une bête), la date du mouvement comptable d'achat était réécrite à *aujourd'hui*. Désormais, en mise à jour on **conserve la date existante** du mouvement, et la date d'entrée est **obligatoire pour un achat** (validée côté action `app/actions/animaux.ts` + champ requis dans `components/animal-form.tsx`). La vente n'était pas concernée (pas de fallback).
- **✨ Comptabilité « toutes les années ».** Le sélecteur de période propose une option **Toutes les années** : totaux cumulés, graphe **par année** (au lieu de par mois), répartition par catégorie et journal sur l'ensemble des exercices. Nouveau `bilanGlobal()` (`lib/services/comptabilite.ts`), `BilanChart` généralisé (points mois **ou** années). ⚠️ Piège rencontré : la constante `TOUTES_ANNEES` doit vivre dans `lib/constants.ts` (module neutre) et non dans un composant `"use client"` — sinon, importée dans un Server Component, elle devient une référence proxy et la comparaison échoue silencieusement.
