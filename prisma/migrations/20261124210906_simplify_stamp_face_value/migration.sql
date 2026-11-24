BEGIN;

-- Create a temporary column for the new textual face value.
ALTER TABLE "Stamp"
ADD COLUMN "faceValueText" TEXT;

-- Preserve the original printed denomination whenever available.
UPDATE "Stamp"
SET "faceValueText" = "denomination"
WHERE NULLIF(BTRIM("denomination"), '') IS NOT NULL;

-- Preserve numeric values and currency codes when no
-- original printed denomination exists.
UPDATE "Stamp" AS s
SET "faceValueText" = CONCAT_WS(
    ' ',
    TRIM_SCALE(s."faceValue")::TEXT,
    c."code"
)
FROM "Currency" AS c
WHERE s."currencyId" = c."id"
AND s."faceValueText" IS NULL;

-- Defensive fallback for numeric values without a currency.
UPDATE "Stamp"
SET "faceValueText" = TRIM_SCALE("faceValue")::TEXT
WHERE "faceValueText" IS NULL
AND "faceValue" IS NOT NULL;

-- Verify that all existing denomination information
-- has been transferred before dropping any columns.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Stamp"
        WHERE (
            NULLIF(BTRIM("denomination"), '') IS NOT NULL
            OR "faceValue" IS NOT NULL
            OR "currencyId" IS NOT NULL
        )
        AND NULLIF(BTRIM("faceValueText"), '') IS NULL
    ) THEN
        RAISE EXCEPTION
            'Face value migration failed: information not transferred';
    END IF;
END $$;

-- Remove the old numeric face value validation.
ALTER TABLE "Stamp"
DROP CONSTRAINT "Stamp_faceValue_check";

-- Remove the obsolete currency relationship.
ALTER TABLE "Stamp"
DROP CONSTRAINT "Stamp_currencyId_fkey";

DROP INDEX "Stamp_currencyId_idx";

-- Remove the obsolete fields.
ALTER TABLE "Stamp"
DROP COLUMN "denomination",
DROP COLUMN "faceValue",
DROP COLUMN "currencyId";

-- Promote the new textual face value.
ALTER TABLE "Stamp"
RENAME COLUMN "faceValueText" TO "faceValue";

COMMIT;