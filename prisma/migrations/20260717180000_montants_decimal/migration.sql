-- Montants Float (double precision) → Decimal (numeric) pour une compta exacte.
ALTER TABLE "Animal" ALTER COLUMN "coutAchat" TYPE DECIMAL(10,2) USING ("coutAchat"::numeric);

ALTER TABLE "Vente" ALTER COLUMN "prix" TYPE DECIMAL(10,2) USING ("prix"::numeric);
ALTER TABLE "Vente" ALTER COLUMN "poids" TYPE DECIMAL(8,3) USING ("poids"::numeric);
ALTER TABLE "Vente" ALTER COLUMN "prixAuKilo" TYPE DECIMAL(10,2) USING ("prixAuKilo"::numeric);
ALTER TABLE "Vente" ALTER COLUMN "marge" TYPE DECIMAL(10,2) USING ("marge"::numeric);

ALTER TABLE "MouvementComptable" ALTER COLUMN "montant" TYPE DECIMAL(10,2) USING ("montant"::numeric);
