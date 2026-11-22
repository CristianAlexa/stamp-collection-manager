BEGIN;

/*
  Warnings:

  - A unique constraint covering the columns `[id,countryId]` on the table `Stamp` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Stamp" ADD COLUMN     "currencyId" TEXT,
ADD COLUMN     "denomination" TEXT,
ADD COLUMN     "faceValue" DECIMAL(14,6),
ADD COLUMN     "heightMm" DECIMAL(7,3),
ADD COLUMN     "issueDay" INTEGER,
ADD COLUMN     "issueMonth" INTEGER,
ADD COLUMN     "widthMm" DECIMAL(7,3),
ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Catalogue" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Catalogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogueReference" (
    "id" TEXT NOT NULL,
    "catalogueNumber" TEXT NOT NULL,
    "catalogueId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "stampId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogueReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Catalogue_code_key" ON "Catalogue"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Catalogue_name_key" ON "Catalogue"("name");

-- CreateIndex
CREATE INDEX "CatalogueReference_stampId_countryId_idx" ON "CatalogueReference"("stampId", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogueReference_catalogueId_countryId_catalogueNumber_key" ON "CatalogueReference"("catalogueId", "countryId", "catalogueNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogueReference_stampId_catalogueId_key" ON "CatalogueReference"("stampId", "catalogueId");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE INDEX "Stamp_currencyId_idx" ON "Stamp"("currencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Stamp_id_countryId_key" ON "Stamp"("id", "countryId");

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogueReference" ADD CONSTRAINT "CatalogueReference_catalogueId_fkey" FOREIGN KEY ("catalogueId") REFERENCES "Catalogue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogueReference" ADD CONSTRAINT "CatalogueReference_stampId_countryId_fkey" FOREIGN KEY ("stampId", "countryId") REFERENCES "Stamp"("id", "countryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Assign codes to our existing reference countries.
UPDATE "Country"
SET "code" = 'GB'
WHERE "name" = 'Great Britain'
  AND "code" IS NULL;

UPDATE "Country"
SET "code" = 'FR'
WHERE "name" = 'France'
  AND "code" IS NULL;

-- Validate partial issue dates.
ALTER TABLE "Stamp"
ADD CONSTRAINT "Stamp_issueDate_check"
CHECK (
    "year" BETWEEN 1 AND 9999
    AND (
        "issueMonth" IS NULL
        OR "issueMonth" BETWEEN 1 AND 12
    )
    AND (
        "issueDay" IS NULL
        OR (
            "issueMonth" IS NOT NULL
            AND "issueDay" BETWEEN 1 AND 31
            AND "issueDay" <= EXTRACT(
                DAY FROM (
                    make_date("year", "issueMonth", 1)
                    + INTERVAL '1 month - 1 day'
                )
            )
        )
    )
);

-- Physical dimensions must be positive when provided.
ALTER TABLE "Stamp"
ADD CONSTRAINT "Stamp_dimensions_check"
CHECK (
    ("widthMm" IS NULL OR "widthMm" > 0)
    AND
    ("heightMm" IS NULL OR "heightMm" > 0)
);

-- Face value cannot be negative.
ALTER TABLE "Stamp"
ADD CONSTRAINT "Stamp_faceValue_check"
CHECK (
    ("faceValue" IS NULL OR "faceValue" >= 0)
    AND
    ("faceValue" IS NULL OR "currencyId" IS NOT NULL)
);

-- Prevent empty catalogue numbers.
ALTER TABLE "CatalogueReference"
ADD CONSTRAINT "CatalogueReference_number_check"
CHECK (
    length(btrim("catalogueNumber")) > 0
    AND "catalogueNumber" = btrim("catalogueNumber")
);

COMMIT;