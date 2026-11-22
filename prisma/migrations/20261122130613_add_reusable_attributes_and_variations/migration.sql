BEGIN;

-- CreateEnum
CREATE TYPE "WatermarkStatus" AS ENUM ('NONE', 'PRESENT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "WatermarkOrientation" AS ENUM ('NORMAL', 'INVERTED', 'REVERSED', 'INVERTED_REVERSED', 'SIDEWAYS_LEFT', 'SIDEWAYS_RIGHT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PerforationType" AS ENUM ('PERFORATED', 'IMPERFORATE', 'PARTIALLY_PERFORATED', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Stamp" ADD COLUMN     "perforationId" TEXT,
ADD COLUMN     "perforationType" "PerforationType" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "seriesId" TEXT,
ADD COLUMN     "stampTypeId" TEXT,
ADD COLUMN     "watermarkId" TEXT,
ADD COLUMN     "watermarkOrientation" "WatermarkOrientation",
ADD COLUMN     "watermarkStatus" "WatermarkStatus" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "Colour" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hexCode" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Colour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StampColour" (
    "stampId" TEXT NOT NULL,
    "colourId" TEXT NOT NULL,

    CONSTRAINT "StampColour_pkey" PRIMARY KEY ("stampId","colourId")
);

-- CreateTable
CREATE TABLE "Watermark" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Watermark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatermarkCountry" (
    "watermarkId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "WatermarkCountry_pkey" PRIMARY KEY ("watermarkId","countryId")
);

-- CreateTable
CREATE TABLE "Perforation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "horizontal" DECIMAL(6,3),
    "vertical" DECIMAL(6,3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Perforation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StampType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StampType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StampSeries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StampSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StampTheme" (
    "stampId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,

    CONSTRAINT "StampTheme_pkey" PRIMARY KEY ("stampId","themeId")
);

-- CreateTable
CREATE TABLE "VariationType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariationValue" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "variationTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariationValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StampVariant" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "stampId" TEXT NOT NULL,
    "watermarkStatus" "WatermarkStatus",
    "watermarkOrientation" "WatermarkOrientation",
    "watermarkId" TEXT,
    "perforationType" "PerforationType",
    "perforationId" TEXT,
    "widthMm" DECIMAL(7,3),
    "heightMm" DECIMAL(7,3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StampVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariantAttribute" (
    "variantId" TEXT NOT NULL,
    "valueId" TEXT NOT NULL,

    CONSTRAINT "VariantAttribute_pkey" PRIMARY KEY ("variantId","valueId")
);

-- CreateTable
CREATE TABLE "VariantColour" (
    "variantId" TEXT NOT NULL,
    "colourId" TEXT NOT NULL,

    CONSTRAINT "VariantColour_pkey" PRIMARY KEY ("variantId","colourId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Colour_name_key" ON "Colour"("name");

-- CreateIndex
CREATE INDEX "StampColour_colourId_idx" ON "StampColour"("colourId");

-- CreateIndex
CREATE INDEX "Watermark_name_idx" ON "Watermark"("name");

-- CreateIndex
CREATE INDEX "WatermarkCountry_countryId_idx" ON "WatermarkCountry"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Perforation_name_key" ON "Perforation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StampType_name_key" ON "StampType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StampSeries_countryId_name_key" ON "StampSeries"("countryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");

-- CreateIndex
CREATE INDEX "StampTheme_themeId_idx" ON "StampTheme"("themeId");

-- CreateIndex
CREATE UNIQUE INDEX "VariationType_name_key" ON "VariationType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VariationValue_variationTypeId_value_key" ON "VariationValue"("variationTypeId", "value");

-- CreateIndex
CREATE INDEX "StampVariant_stampId_idx" ON "StampVariant"("stampId");

-- CreateIndex
CREATE INDEX "VariantAttribute_valueId_idx" ON "VariantAttribute"("valueId");

-- CreateIndex
CREATE INDEX "VariantColour_colourId_idx" ON "VariantColour"("colourId");

-- CreateIndex
CREATE INDEX "Stamp_watermarkId_idx" ON "Stamp"("watermarkId");

-- CreateIndex
CREATE INDEX "Stamp_perforationId_idx" ON "Stamp"("perforationId");

-- CreateIndex
CREATE INDEX "Stamp_stampTypeId_idx" ON "Stamp"("stampTypeId");

-- CreateIndex
CREATE INDEX "Stamp_seriesId_idx" ON "Stamp"("seriesId");

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_watermarkId_fkey" FOREIGN KEY ("watermarkId") REFERENCES "Watermark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_perforationId_fkey" FOREIGN KEY ("perforationId") REFERENCES "Perforation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_stampTypeId_fkey" FOREIGN KEY ("stampTypeId") REFERENCES "StampType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "StampSeries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampColour" ADD CONSTRAINT "StampColour_stampId_fkey" FOREIGN KEY ("stampId") REFERENCES "Stamp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampColour" ADD CONSTRAINT "StampColour_colourId_fkey" FOREIGN KEY ("colourId") REFERENCES "Colour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatermarkCountry" ADD CONSTRAINT "WatermarkCountry_watermarkId_fkey" FOREIGN KEY ("watermarkId") REFERENCES "Watermark"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatermarkCountry" ADD CONSTRAINT "WatermarkCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampSeries" ADD CONSTRAINT "StampSeries_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampTheme" ADD CONSTRAINT "StampTheme_stampId_fkey" FOREIGN KEY ("stampId") REFERENCES "Stamp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampTheme" ADD CONSTRAINT "StampTheme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariationValue" ADD CONSTRAINT "VariationValue_variationTypeId_fkey" FOREIGN KEY ("variationTypeId") REFERENCES "VariationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampVariant" ADD CONSTRAINT "StampVariant_stampId_fkey" FOREIGN KEY ("stampId") REFERENCES "Stamp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampVariant" ADD CONSTRAINT "StampVariant_watermarkId_fkey" FOREIGN KEY ("watermarkId") REFERENCES "Watermark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampVariant" ADD CONSTRAINT "StampVariant_perforationId_fkey" FOREIGN KEY ("perforationId") REFERENCES "Perforation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantAttribute" ADD CONSTRAINT "VariantAttribute_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "StampVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantAttribute" ADD CONSTRAINT "VariantAttribute_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "VariationValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantColour" ADD CONSTRAINT "VariantColour_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "StampVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantColour" ADD CONSTRAINT "VariantColour_colourId_fkey" FOREIGN KEY ("colourId") REFERENCES "Colour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Existing stamps have unverified watermark information.
UPDATE "Stamp"
SET "watermarkStatus" = 'UNKNOWN';

-- Validate watermark information.
ALTER TABLE "Stamp"
ADD CONSTRAINT "Stamp_watermark_check"
CHECK (
    (
        "watermarkStatus" = 'PRESENT'
        AND "watermarkId" IS NOT NULL
    )
    OR (
        "watermarkStatus" IN ('NONE', 'UNKNOWN')
        AND "watermarkId" IS NULL
        AND "watermarkOrientation" IS NULL
    )
);

-- Validate perforation information.
ALTER TABLE "Stamp"
ADD CONSTRAINT "Stamp_perforation_check"
CHECK (
    "perforationType" IN (
        'PERFORATED',
        'PARTIALLY_PERFORATED'
    )
    OR "perforationId" IS NULL
);

-- Perforation measurements must be positive.
ALTER TABLE "Perforation"
ADD CONSTRAINT "Perforation_measurements_check"
CHECK (
    ("horizontal" IS NULL OR "horizontal" > 0)
    AND
    ("vertical" IS NULL OR "vertical" > 0)
    AND
    ("horizontal" IS NOT NULL OR "vertical" IS NOT NULL)
);

-- Validate optional HEX colour codes.
ALTER TABLE "Colour"
ADD CONSTRAINT "Colour_hexCode_check"
CHECK (
    "hexCode" IS NULL
    OR "hexCode" ~ '^#[0-9A-Fa-f]{6}$'
);

-- Variation dimensions must be positive.
ALTER TABLE "StampVariant"
ADD CONSTRAINT "StampVariant_dimensions_check"
CHECK (
    ("widthMm" IS NULL OR "widthMm" > 0)
    AND
    ("heightMm" IS NULL OR "heightMm" > 0)
);

COMMIT;