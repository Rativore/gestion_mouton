# Analyse de la structure & plan de mise en production

_Projet : **Mon Troupeau** — gestion / traçabilité / comptabilité d'un élevage._
_Objectif du document : évaluer l'état du code (V1) et définir le chemin vers une mise en production sur serveur avec PostgreSQL._

---

## 1. Architecture actuelle

Stack : **Next.js 16 (App Router) · React 19 · TypeScript · Prisma 6 · SQLite · Tailwind 4**.

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
│  SQLite (dev.db)                                          │
└─────────────────────────────────────────────────────────┘
```

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

### 🔴 Critique (à traiter avant toute compta réelle)
- **Montants en `Float`** (`schema.prisma` : `coutAchat`, `prix`, `prixAuKilo`, `marge`, `montant`). La virgule flottante provoque des erreurs d'arrondi (`0.1+0.2≠0.3`) → inacceptable en comptabilité. → **`Decimal`** (ou centimes entiers).

### 🟠 Bloquant pour un déploiement serveur
- **Stockage photos sur disque local** (`lib/upload.ts` → `public/uploads/`). Perdu au redéploiement, non partagé entre instances, incompatible serverless. → **stockage objet** (S3 / Cloudflare R2 / Vercel Blob).
- **Aucune authentification.** Acceptable en local mono-utilisateur, requis dès la mise en ligne. → **Auth.js** + rattachement des données à un `User`.
- **Secrets & env** : s'assurer que `.env` n'est pas versionné et que `DATABASE_URL` de prod passe par les variables d'environnement du serveur.

### 🟡 À corriger (fiabilité / portabilité)
- **Recherche sensible à la casse sur PostgreSQL** (`lib/services/animaux.ts:20-22`, `contains`). SQLite est insensible par défaut, Postgres non. → ajouter `mode: "insensitive"`.
- **Suppression d'un animal déjà vendu** : `Vente.animal` n'a pas de règle `onDelete`. Supprimer une bête vendue échouera (violation de clé étrangère). → définir un comportement explicite (interdire, ou cascader vers la vente).
- **Migrations SQLite non transposables** telles quelles vers Postgres : il faudra régénérer l'historique de migration sur la nouvelle base.
- **Gestion d'erreurs générique** (`app/actions/animaux.ts:80`, `saisie.ts:73` : `catch {}`) : messages peu précis pour l'utilisateur.

### ⚪ Améliorations (qualité)
- **Validation** : entrées des Server Actions validées à la main → introduire **Zod** (schémas réutilisables, messages clairs).
- **Tests** absents : cibler la logique critique (vente, achat, `bilanAnnuel`).
- **Énumérations en `String`** (statut, sexe, typeFlux…) : envisager des enums Prisma natifs sur Postgres.
- Quelques modèles sans `updatedAt` (`Vente`, `MouvementComptable`).

---

## 4. Plan de tâches

Effort indicatif : **S** = < ½ j · **M** = ½–1 j · **L** = 1–3 j.

### Phase 0 — Stabilisation V1 (rapide, sans changer d'infra)
- [ ] Ajouter `mode: "insensitive"` sur les `contains` (fait en même temps que Postgres) — **S**
- [ ] Corriger la suppression d'un animal vendu (règle `onDelete` ou blocage explicite) — **S**
- [ ] Messages d'erreur plus précis dans les actions — **S**
- [ ] Exclure `.next/` de la synchro OneDrive (évite les verrous de build) — **S**

### Phase 1 — Base de données prod (PostgreSQL + Decimal) 🎯
- [ ] Provisionner une base **PostgreSQL** (Neon / Supabase / RDS…) — **S**
- [ ] Passer `provider = "postgresql"` + `DATABASE_URL` par variable d'env — **S**
- [ ] Convertir les montants `Float → Decimal` (schéma + services + formatage) — **M**
- [ ] Régénérer les migrations sur Postgres, script de **seed** adapté — **M**
- [ ] (Option) Enums natifs pour statut/sexe/typeFlux/espèce — **M**

### Phase 2 — Prêt pour le serveur
- [ ] **Stockage objet** pour les photos (S3/R2) + adapter `lib/upload.ts` — **M**
- [ ] **Authentification** (Auth.js) + modèle `User`, rattacher les données — **L**
- [ ] Choisir l'**hébergement** (Vercel, VPS + Docker, …) & pipeline de déploiement — **M**
- [ ] Variables d'environnement / secrets de prod, sauvegardes DB — **S**

### Phase 3 — Qualité & robustesse
- [ ] **Zod** sur toutes les Server Actions — **M**
- [ ] **Tests** de la logique critique (vente/achat/bilan) — **M**
- [ ] Journalisation des erreurs (Sentry ou équivalent) — **S**
- [ ] Accessibilité & responsive : passe finale — **S**

### Phase 4 — Fonctionnel (nice-to-have)
- [ ] Export comptable (CSV / PDF) — **M**
- [ ] Date de décès + motif sur la mise en « mort » — **S**
- [ ] Tableau de bord enrichi (marge par animal, alertes santé) — **M**
- [ ] PWA installable / mode hors-ligne — **L**

---

## 5. Ordre recommandé

**Phase 0** (rapide) → **Phase 1** (Postgres + Decimal, à faire d'un bloc car les deux touchent le schéma) → **Phase 2** (photos, puis auth quand on ouvre à d'autres utilisateurs) → **Phases 3–4** en continu.

> La Phase 1 est le vrai jalon « prod-ready » côté données. L'authentification (Phase 2) est le prérequis pour toute ouverture commerciale.
