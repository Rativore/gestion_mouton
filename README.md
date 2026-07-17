# 🐑 Mon Troupeau

Application de **gestion, traçabilité et comptabilité** d'un élevage de moutons / chèvres.
Cible : une **PWA mobile simple, pour 2 utilisateurs**.

🌐 **En ligne : https://gestion-mouton.vercel.app**

**Stack :** Next.js 16 (App Router) · React 19 · TypeScript · Prisma 6 · PostgreSQL (Supabase) · Tailwind 4.

## Démarrage

```bash
npm install
npm run dev        # http://localhost:3000
```

La base pointe sur **Supabase** via `.env` (`DATABASE_URL` / `DIRECT_URL`) — fichier non versionné, à recréer depuis Supabase (onglet **Connect → ORMs → Prisma**).

> ⚠️ Le réseau Klesia bloque les ports PostgreSQL : l'app ne peut pas joindre Supabase depuis ce poste.
> Utiliser un réseau non filtré en local, ou déployer sur Vercel. Détails dans la doc.

## 📚 Documentation

Toute la documentation est dans [`docs/`](./docs/) :

- [`docs/README.md`](./docs/README.md) — présentation, démarrage, pièges d'environnement, état du projet.
- [`docs/ANALYSE.md`](./docs/ANALYSE.md) — analyse de la structure, points d'attention et **plan de tâches** vers l'app mobile.
