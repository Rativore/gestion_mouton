import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client Supabase à privilèges élevés (clé secrète). À N'UTILISER QUE côté
// serveur : la clé secrète contourne les règles d'accès (RLS) du Storage.
// `server-only` fait échouer le build si ce module est importé côté client.

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  throw new Error(
    "SUPABASE_URL et SUPABASE_SECRET_KEY doivent être définis dans .env.",
  );
}

export const supabaseAdmin = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Bucket Storage où sont stockées les photos des animaux. */
export const BUCKET_PHOTOS = "animaux";
