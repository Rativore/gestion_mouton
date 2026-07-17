"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker (public/sw.js) côté client. Uniquement en
 * production : en dev, un SW interfère avec le rechargement à chaud (HMR).
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Échec silencieux : l'app fonctionne sans le service worker.
    });
  }, []);

  return null;
}
