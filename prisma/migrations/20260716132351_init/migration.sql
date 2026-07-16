-- CreateTable
CREATE TABLE "Animal" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Animal_mereId_fkey" FOREIGN KEY ("mereId") REFERENCES "Animal" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Animal_pereId_fkey" FOREIGN KEY ("pereId") REFERENCES "Animal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvenementSante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "animalId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvenementSante_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "animalId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "prix" REAL NOT NULL,
    "acheteur" TEXT,
    "poids" REAL,
    "prixAuKilo" REAL,
    "motif" TEXT,
    "marge" REAL,
    "mouvementId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vente_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vente_mouvementId_fkey" FOREIGN KEY ("mouvementId") REFERENCES "MouvementComptable" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MouvementComptable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "typeFlux" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Categorie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "typeFlux" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Animal_numero_key" ON "Animal"("numero");

-- CreateIndex
CREATE INDEX "Animal_statut_idx" ON "Animal"("statut");

-- CreateIndex
CREATE INDEX "Animal_espece_idx" ON "Animal"("espece");

-- CreateIndex
CREATE INDEX "EvenementSante_animalId_idx" ON "EvenementSante"("animalId");

-- CreateIndex
CREATE UNIQUE INDEX "Vente_animalId_key" ON "Vente"("animalId");

-- CreateIndex
CREATE UNIQUE INDEX "Vente_mouvementId_key" ON "Vente"("mouvementId");

-- CreateIndex
CREATE INDEX "Vente_date_idx" ON "Vente"("date");

-- CreateIndex
CREATE INDEX "MouvementComptable_date_idx" ON "MouvementComptable"("date");

-- CreateIndex
CREATE INDEX "MouvementComptable_typeFlux_idx" ON "MouvementComptable"("typeFlux");

-- CreateIndex
CREATE UNIQUE INDEX "Categorie_nom_typeFlux_key" ON "Categorie"("nom", "typeFlux");
