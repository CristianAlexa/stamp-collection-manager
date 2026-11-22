BEGIN;

/*
  Warnings:

  - A unique constraint covering the columns `[id,catalogueId,stampId]` on the table `CatalogueReference` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,stampId]` on the table `StampVariant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StampStatus" AS ENUM ('MNH', 'MH', 'USED', 'CTO');

-- CreateTable
CREATE TABLE "CatalogueEdition" (
    "id" TEXT NOT NULL,
    "catalogueId" TEXT NOT NULL,
    "publicationYear" INTEGER NOT NULL,
    "editionName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogueEdition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogueValuation" (
    "id" TEXT NOT NULL,
    "catalogueId" TEXT NOT NULL,
    "catalogueReferenceId" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "stampId" TEXT NOT NULL,
    "variantId" TEXT,
    "status" "StampStatus" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currencyId" TEXT NOT NULL,
    "sourcePage" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogueValuation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogueEdition_catalogueId_publicationYear_editionName_key" ON "CatalogueEdition"("catalogueId", "publicationYear", "editionName");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogueEdition_id_catalogueId_key" ON "CatalogueEdition"("id", "catalogueId");

-- CreateIndex
CREATE INDEX "CatalogueValuation_catalogueReferenceId_status_idx" ON "CatalogueValuation"("catalogueReferenceId", "status");

-- CreateIndex
CREATE INDEX "CatalogueValuation_editionId_catalogueId_idx" ON "CatalogueValuation"("editionId", "catalogueId");

-- CreateIndex
CREATE INDEX "CatalogueValuation_variantId_stampId_idx" ON "CatalogueValuation"("variantId", "stampId");

-- CreateIndex
CREATE INDEX "CatalogueValuation_currencyId_idx" ON "CatalogueValuation"("currencyId");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogueReference_id_catalogueId_stampId_key" ON "CatalogueReference"("id", "catalogueId", "stampId");

-- CreateIndex
CREATE UNIQUE INDEX "StampVariant_id_stampId_key" ON "StampVariant"("id", "stampId");

-- AddForeignKey
ALTER TABLE "CatalogueEdition" ADD CONSTRAINT "CatalogueEdition_catalogueId_fkey" FOREIGN KEY ("catalogueId") REFERENCES "Catalogue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogueValuation" ADD CONSTRAINT "CatalogueValuation_catalogueReferenceId_catalogueId_stampI_fkey" FOREIGN KEY ("catalogueReferenceId", "catalogueId", "stampId") REFERENCES "CatalogueReference"("id", "catalogueId", "stampId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogueValuation" ADD CONSTRAINT "CatalogueValuation_editionId_catalogueId_fkey" FOREIGN KEY ("editionId", "catalogueId") REFERENCES "CatalogueEdition"("id", "catalogueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogueValuation" ADD CONSTRAINT "CatalogueValuation_variantId_stampId_fkey" FOREIGN KEY ("variantId", "stampId") REFERENCES "StampVariant"("id", "stampId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogueValuation" ADD CONSTRAINT "CatalogueValuation_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Catalogue publication years must be valid.
ALTER TABLE "CatalogueEdition"
ADD CONSTRAINT "CatalogueEdition_year_check"
CHECK (
    "publicationYear" BETWEEN 1 AND 9999
);

-- Catalogue edition names cannot be empty.
ALTER TABLE "CatalogueEdition"
ADD CONSTRAINT "CatalogueEdition_name_check"
CHECK (
    length(btrim("editionName")) > 0
);

-- Catalogue values cannot be negative.
ALTER TABLE "CatalogueValuation"
ADD CONSTRAINT "CatalogueValuation_amount_check"
CHECK (
    "amount" >= 0
);

-- Prevent duplicate general catalogue valuations.
CREATE UNIQUE INDEX "CatalogueValuation_general_unique"
ON "CatalogueValuation" (
    "catalogueReferenceId",
    "editionId",
    "status"
)
WHERE "variantId" IS NULL;

-- Prevent duplicate variation-specific valuations.
CREATE UNIQUE INDEX "CatalogueValuation_variant_unique"
ON "CatalogueValuation" (
    "catalogueReferenceId",
    "editionId",
    "status",
    "variantId"
)
WHERE "variantId" IS NOT NULL;

COMMIT;