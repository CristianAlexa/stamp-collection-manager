BEGIN;

-- 1. Create the new optional text fields.
ALTER TABLE "Stamp"
ADD COLUMN "colour" TEXT;

ALTER TABLE "StampVariant"
ADD COLUMN "colour" TEXT;

-- 2. Transfer existing stamp colours.
-- Multiple colours are combined into a single text value.
UPDATE "Stamp" AS s
SET "colour" = source.colours
FROM (
    SELECT
        sc."stampId",
        STRING_AGG(
            c."name",
            ', ' ORDER BY c."name"
        ) AS colours
    FROM "StampColour" AS sc
    INNER JOIN "Colour" AS c
        ON c."id" = sc."colourId"
    GROUP BY sc."stampId"
) AS source
WHERE s."id" = source."stampId";

-- 3. Transfer existing variant colours.
UPDATE "StampVariant" AS v
SET "colour" = source.colours
FROM (
    SELECT
        vc."variantId",
        STRING_AGG(
            c."name",
            ', ' ORDER BY c."name"
        ) AS colours
    FROM "VariantColour" AS vc
    INNER JOIN "Colour" AS c
        ON c."id" = vc."colourId"
    GROUP BY vc."variantId"
) AS source
WHERE v."id" = source."variantId";

-- 4. Verify that linked colours were transferred.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "StampColour" sc
        JOIN "Stamp" s ON s."id" = sc."stampId"
        WHERE s."colour" IS NULL
    ) THEN
        RAISE EXCEPTION 'Stamp colour migration failed';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "VariantColour" vc
        JOIN "StampVariant" v ON v."id" = vc."variantId"
        WHERE v."colour" IS NULL
    ) THEN
        RAISE EXCEPTION 'Variant colour migration failed';
    END IF;
END $$;

-- 5. Remove the obsolete relationship tables.
DROP TABLE "StampColour";
DROP TABLE "VariantColour";

-- 6. Remove the obsolete colour library.
DROP TABLE "Colour";

COMMIT;