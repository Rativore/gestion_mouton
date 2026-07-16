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
- **Comptabilité** : bilan annuel + mensuel (graphe), répartition par catégorie, journal des mouvements.
- **Réglages** : devise, espèces d'animaux, catégories de gains/dépenses.

Cible : web responsive (mono-utilisateur aujourd'hui), pensé pour évoluer en produit commercial.

---

## 2. Stack

**Next.js 16 (App Router) · React 19 · TypeScript · Prisma 6 · SQLite · Tailwind 4.**
Server Components (lecture) + Server Actions (écriture).

---

## 3. Démarrage rapide

```bash
npm install
npm run dev        # http://localhost:3000
npm run seed       # (ré)injecte des données de démo
```

Autres commandes utiles :
```bash
npx prisma studio          # explorer la base
npx prisma migrate dev     # créer/appliquer une migration
npm run build              # build de production
```

### ⚠️ Pièges d'environnement (nous ont fait perdre du temps — à connaître)

1. **Node : utiliser la v24, pas la v12.** La machine a nvm avec **v12.13 liée par défaut** → `next dev` plante (`Unexpected token '?'`). Node 24 est dans `C:\Program Files\nodejs`.
   - Fix ponctuel : `$env:Path = "C:\Program Files\nodejs;" + $env:Path`
   - Fix permanent : `nvm unlink` puis rouvrir le terminal.

2. **Commandes Prisma en réseau Klesia** : l'inspection TLS bloque le téléchargement des binaires. Préfixer par :
   ```powershell
   $env:NODE_OPTIONS="--use-system-ca"; npx prisma migrate dev ...
   ```
   (Node 24 fait alors confiance au magasin de certificats Windows.)

3. **OneDrive verrouille `.next`** : `npm run build` peut échouer avec `EPERM ... .next`. Arrêter le serveur avant, ou exclure `.next/` de la synchro OneDrive. Pour juste vérifier les types sans build : `npx tsc --noEmit`.

4. **Migration = serveur arrêté** : `prisma migrate`/`generate` échoue (`EPERM`) si un `next dev` tourne (moteur Prisma verrouillé). Arrêter le serveur, migrer, relancer.

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
  upload.ts             Enregistrement des photos (local pour l'instant)
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

**V1 fonctionnelle** ✅ — toutes les fonctionnalités ci-dessus marchent en local (SQLite).

**Prochaines étapes** → voir [`docs/ANALYSE.md`](./ANALYSE.md). Résumé de la route vers la prod :
1. **Phase 0** — stabilisation rapide (recherche insensible à la casse, suppression d'un animal vendu, messages d'erreur).
2. **Phase 1** 🎯 — **PostgreSQL + montants `Float → Decimal`** (le vrai jalon prod-ready données).
3. **Phase 2** — stockage photos (S3/R2), authentification (Auth.js), hébergement.
4. **Phases 3–4** — Zod, tests, exports, PWA.

**Points d'attention connus** (détaillés dans ANALYSE.md) :
- 🔴 Montants en `Float` → passer en `Decimal` avant compta réelle.
- 🟠 Photos sur disque local → stockage objet pour un vrai serveur.
- 🟡 Recherche sensible à la casse sur Postgres ; suppression d'un animal vendu à sécuriser.
