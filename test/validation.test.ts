import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  valider,
  texteRequis,
  nombrePositif,
  dateRequise,
  texteOptionnel,
  nombreOptionnel,
} from "@/lib/validation";

function fd(obj: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.append(k, v);
  return f;
}

test("nombrePositif : rejette 0, négatif et vide ; accepte > 0", () => {
  const schema = z.object({ prix: nombrePositif("Le prix doit être positif.") });
  assert.deepEqual(valider(schema, fd({ prix: "12.5" })), { data: { prix: 12.5 } });

  for (const mauvais of ["0", "-3", ""]) {
    const res = valider(schema, fd({ prix: mauvais }));
    assert.ok("error" in res, `attendu une erreur pour "${mauvais}"`);
    assert.equal(res.error, "Le prix doit être positif.");
  }
});

test("texteRequis : rejette vide/espaces, trim la valeur", () => {
  const schema = z.object({ nom: texteRequis("Le nom est requis.") });
  assert.deepEqual(valider(schema, fd({ nom: "  Bella  " })), {
    data: { nom: "Bella" },
  });
  const res = valider(schema, fd({ nom: "   " }));
  assert.ok("error" in res);
  assert.equal(res.error, "Le nom est requis.");
});

test("dateRequise : coerce une date ISO, rejette l'absence", () => {
  const schema = z.object({ date: dateRequise("Date requise.") });
  const res = valider(schema, fd({ date: "2026-07-18" }));
  assert.ok("data" in res);
  assert.ok(res.data.date instanceof Date);
  assert.equal(res.data.date.getUTCFullYear(), 2026);

  const vide = valider(schema, fd({ date: "" }));
  assert.ok("error" in vide);
  assert.equal(vide.error, "Date requise.");
});

test("champs optionnels : vide → undefined", () => {
  const schema = z.object({
    note: texteOptionnel,
    poids: nombreOptionnel,
  });
  assert.deepEqual(valider(schema, fd({ note: "", poids: "" })), {
    data: { note: undefined, poids: undefined },
  });
  assert.deepEqual(valider(schema, fd({ note: " ok ", poids: "3.5" })), {
    data: { note: "ok", poids: 3.5 },
  });
});

test("valider : ignore les clés non déclarées (ex. photo)", () => {
  const schema = z.object({ nom: texteRequis("requis") });
  const res = valider(schema, fd({ nom: "X", photo: "fichier.png" }));
  assert.deepEqual(res, { data: { nom: "X" } });
});
