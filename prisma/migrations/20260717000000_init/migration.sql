-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "espece" TEXT NOT NULL,
    "race" TEXT,
    "sexe" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "couleur" TEXT,
    "signes" TEXT,
    "photoUrl" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'present',
    "note" TEXT,
    "origine" TEXT NOT NULL DEFAULT 'naissance',
    "dateEntree" TIMESTAMP(3),
    "coutAchat" DOUBLE PRECISION,
    "mereId" TEXT,
    "pereId" TEXT,
    "pereExterieur" TEXT,
    "mouvementAchatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvenementSante" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvenementSante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vente" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "acheteur" TEXT,
    "poids" DOUBLE PRECISION,
    "prixAuKilo" DOUBLE PRECISION,
    "motif" TEXT,
    "marge" DOUBLE PRECISION,
    "mouvementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MouvementComptable" (
    "id" TEXT NOT NULL,
    "typeFlux" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MouvementComptable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parametre" (
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,

    CONSTRAINT "Parametre_pkey" PRIMARY KEY ("cle")
);

-- CreateTable
CREATE TABLE "Espece" (
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Espece_pkey" PRIMARY KEY ("value")
);

-- CreateTable
CREATE TABLE "Categorie" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "typeFlux" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Categorie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Animal_numero_key" ON "Animal"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Animal_mouvementAchatId_key" ON "Animal"("mouvementAchatId");

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

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_mereId_fkey" FOREIGN KEY ("mereId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_pereId_fkey" FOREIGN KEY ("pereId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_mouvementAchatId_fkey" FOREIGN KEY ("mouvementAchatId") REFERENCES "MouvementComptable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvenementSante" ADD CONSTRAINT "EvenementSante_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vente" ADD CONSTRAINT "Vente_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vente" ADD CONSTRAINT "Vente_mouvementId_fkey" FOREIGN KEY ("mouvementId") REFERENCES "MouvementComptable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
