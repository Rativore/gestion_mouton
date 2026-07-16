-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Animal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "espece" TEXT NOT NULL,
    "race" TEXT,
    "sexe" TEXT,
    "dateNaissance" DATETIME,
    "couleur" TEXT,
    "signes" TEXT,
    "photoUrl" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'present',
    "note" TEXT,
    "origine" TEXT NOT NULL DEFAULT 'naissance',
    "dateEntree" DATETIME,
    "coutAchat" REAL,
    "mereId" TEXT,
    "pereId" TEXT,
    "pereExterieur" TEXT,
    "mouvementAchatId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Animal_mereId_fkey" FOREIGN KEY ("mereId") REFERENCES "Animal" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Animal_pereId_fkey" FOREIGN KEY ("pereId") REFERENCES "Animal" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Animal_mouvementAchatId_fkey" FOREIGN KEY ("mouvementAchatId") REFERENCES "MouvementComptable" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Animal" ("couleur", "coutAchat", "createdAt", "dateEntree", "dateNaissance", "espece", "id", "mereId", "note", "numero", "origine", "pereExterieur", "pereId", "photoUrl", "race", "sexe", "signes", "statut", "updatedAt") SELECT "couleur", "coutAchat", "createdAt", "dateEntree", "dateNaissance", "espece", "id", "mereId", "note", "numero", "origine", "pereExterieur", "pereId", "photoUrl", "race", "sexe", "signes", "statut", "updatedAt" FROM "Animal";
DROP TABLE "Animal";
ALTER TABLE "new_Animal" RENAME TO "Animal";
CREATE UNIQUE INDEX "Animal_numero_key" ON "Animal"("numero");
CREATE UNIQUE INDEX "Animal_mouvementAchatId_key" ON "Animal"("mouvementAchatId");
CREATE INDEX "Animal_statut_idx" ON "Animal"("statut");
CREATE INDEX "Animal_espece_idx" ON "Animal"("espece");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
