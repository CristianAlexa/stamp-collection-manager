BEGIN;

-- CreateEnum
CREATE TYPE "PhysicalGrade" AS ENUM ('EXTRA_FINE', 'FINE', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "StampImageType" AS ENUM ('FRONT', 'BACK', 'DETAIL', 'WATERMARK', 'OTHER');

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stampId" TEXT NOT NULL,
    "variantId" TEXT,
    "albumId" TEXT,
    "status" "StampStatus" NOT NULL,
    "physicalGrade" "PhysicalGrade",
    "conditionNotes" TEXT,
    "purchasePrice" DECIMAL(14,2),
    "purchaseDate" DATE,
    "purchaseCurrencyId" TEXT,
    "estimatedMarketValue" DECIMAL(14,2),
    "marketValueDate" DATE,
    "marketCurrencyId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionImage" (
    "id" TEXT NOT NULL,
    "collectionItemId" TEXT NOT NULL,
    "imageType" "StampImageType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalFileName" TEXT,
    "mimeType" TEXT,
    "fileSizeBytes" INTEGER,
    "widthPx" INTEGER,
    "heightPx" INTEGER,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogueImage" (
    "id" TEXT NOT NULL,
    "stampId" TEXT NOT NULL,
    "variantId" TEXT,
    "imageType" "StampImageType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalFileName" TEXT,
    "mimeType" TEXT,
    "fileSizeBytes" INTEGER,
    "widthPx" INTEGER,
    "heightPx" INTEGER,
    "sourceUrl" TEXT,
    "credit" TEXT,
    "licence" TEXT,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogueImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Album_userId_name_key" ON "Album"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Album_id_userId_key" ON "Album"("id", "userId");

-- CreateIndex
CREATE INDEX "CollectionItem_userId_albumId_idx" ON "CollectionItem"("userId", "albumId");

-- CreateIndex
CREATE INDEX "CollectionItem_userId_stampId_idx" ON "CollectionItem"("userId", "stampId");

-- CreateIndex
CREATE INDEX "CollectionItem_stampId_idx" ON "CollectionItem"("stampId");

-- CreateIndex
CREATE INDEX "CollectionItem_variantId_stampId_idx" ON "CollectionItem"("variantId", "stampId");

-- CreateIndex
CREATE INDEX "CollectionItem_albumId_userId_idx" ON "CollectionItem"("albumId", "userId");

-- CreateIndex
CREATE INDEX "CollectionItem_purchaseCurrencyId_idx" ON "CollectionItem"("purchaseCurrencyId");

-- CreateIndex
CREATE INDEX "CollectionItem_marketCurrencyId_idx" ON "CollectionItem"("marketCurrencyId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionImage_storageKey_key" ON "CollectionImage"("storageKey");

-- CreateIndex
CREATE INDEX "CollectionImage_collectionItemId_sortOrder_idx" ON "CollectionImage"("collectionItemId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogueImage_storageKey_key" ON "CatalogueImage"("storageKey");

-- CreateIndex
CREATE INDEX "CatalogueImage_stampId_sortOrder_idx" ON "CatalogueImage"("stampId", "sortOrder");

-- CreateIndex
CREATE INDEX "CatalogueImage_variantId_stampId_idx" ON "CatalogueImage"("variantId", "stampId");

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_stampId_fkey" FOREIGN KEY ("stampId") REFERENCES "Stamp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_variantId_stampId_fkey" FOREIGN KEY ("variantId", "stampId") REFERENCES "StampVariant"("id", "stampId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_albumId_userId_fkey" FOREIGN KEY ("albumId", "userId") REFERENCES "Album"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_purchaseCurrencyId_fkey" FOREIGN KEY ("purchaseCurrencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_marketCurrencyId_fkey" FOREIGN KEY ("marketCurrencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionImage" ADD CONSTRAINT "CollectionImage_collectionItemId_fkey" FOREIGN KEY ("collectionItemId") REFERENCES "CollectionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogueImage" ADD CONSTRAINT "CatalogueImage_stampId_fkey" FOREIGN KEY ("stampId") REFERENCES "Stamp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogueImage" ADD CONSTRAINT "CatalogueImage_variantId_stampId_fkey" FOREIGN KEY ("variantId", "stampId") REFERENCES "StampVariant"("id", "stampId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Album names cannot be empty.
ALTER TABLE "Album"
ADD CONSTRAINT "Album_name_check"
CHECK (
    length(btrim("name")) > 0
);

-- Purchase prices cannot be negative.
ALTER TABLE "CollectionItem"
ADD CONSTRAINT "CollectionItem_purchasePrice_check"
CHECK (
    "purchasePrice" IS NULL
    OR "purchasePrice" >= 0
);

-- A recorded purchase price requires a currency.
ALTER TABLE "CollectionItem"
ADD CONSTRAINT "CollectionItem_purchaseCurrency_check"
CHECK (
    (
        "purchasePrice" IS NULL
        AND "purchaseCurrencyId" IS NULL
    )
    OR (
        "purchasePrice" IS NOT NULL
        AND "purchaseCurrencyId" IS NOT NULL
    )
);

-- Market values cannot be negative.
ALTER TABLE "CollectionItem"
ADD CONSTRAINT "CollectionItem_marketValue_check"
CHECK (
    "estimatedMarketValue" IS NULL
    OR "estimatedMarketValue" >= 0
);

-- A recorded market value requires a currency.
ALTER TABLE "CollectionItem"
ADD CONSTRAINT "CollectionItem_marketCurrency_check"
CHECK (
    (
        "estimatedMarketValue" IS NULL
        AND "marketCurrencyId" IS NULL
    )
    OR (
        "estimatedMarketValue" IS NOT NULL
        AND "marketCurrencyId" IS NOT NULL
    )
);

-- Validate personal image metadata.
ALTER TABLE "CollectionImage"
ADD CONSTRAINT "CollectionImage_metadata_check"
CHECK (
    length(btrim("storageKey")) > 0
    AND "sortOrder" >= 0
    AND ("fileSizeBytes" IS NULL OR "fileSizeBytes" > 0)
    AND ("widthPx" IS NULL OR "widthPx" > 0)
    AND ("heightPx" IS NULL OR "heightPx" > 0)
);

-- Validate catalogue image metadata.
ALTER TABLE "CatalogueImage"
ADD CONSTRAINT "CatalogueImage_metadata_check"
CHECK (
    length(btrim("storageKey")) > 0
    AND "sortOrder" >= 0
    AND ("fileSizeBytes" IS NULL OR "fileSizeBytes" > 0)
    AND ("widthPx" IS NULL OR "widthPx" > 0)
    AND ("heightPx" IS NULL OR "heightPx" > 0)
);

-- One front and one back image per physical stamp.
CREATE UNIQUE INDEX "CollectionImage_primary_side_unique"
ON "CollectionImage" (
    "collectionItemId",
    "imageType"
)
WHERE "imageType" IN ('FRONT', 'BACK');

COMMIT;