-- Décès d'un animal : date et motif (colonnes nullables, migration additive).
ALTER TABLE "Animal" ADD COLUMN "dateDeces" TIMESTAMP(3);
ALTER TABLE "Animal" ADD COLUMN "motifDeces" TEXT;
