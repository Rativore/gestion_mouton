// Service worker minimal — rend l'app installable (PWA) et donne un repli
// hors-ligne. Stratégie « réseau d'abord » pour les navigations : tant qu'on
// est en ligne, on sert toujours la version fraîche (aucune donnée périmée) ;
// hors-ligne, on retombe sur la dernière page vue en cache.
const CACHE = "troupeau-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Seules les navigations (pages HTML) sont gérées ici ; les mutations et
  // les assets suivent le comportement normal du navigateur.
  if (req.method !== "GET" || req.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match(req);
        return cached || (await caches.match("/")) || Response.error();
      }
    })(),
  );
});
