BEGIN;

-- 1. Create the User table.
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key"
ON "User"("email");

-- 2. Create the Country table.
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Country_name_key"
ON "Country"("name");

CREATE UNIQUE INDEX "Country_code_key"
ON "Country"("code");

-- 3. Copy existing country names into the new table.
INSERT INTO "Country" (
    "id",
    "name",
    "createdAt",
    "updatedAt"
)
SELECT DISTINCT
    'country-' || md5("country"),
    "country",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Stamp";

-- 4. Add countryId as an initially optional column.
ALTER TABLE "Stamp"
ADD COLUMN "countryId" TEXT;

-- 5. Connect existing stamps to their country records.
UPDATE "Stamp" AS s
SET "countryId" = c."id"
FROM "Country" AS c
WHERE s."country" = c."name";

-- 6. Make the foreign key mandatory.
ALTER TABLE "Stamp"
ALTER COLUMN "countryId" SET NOT NULL;

-- 7. Create an index for country filtering.
CREATE INDEX "Stamp_countryId_idx"
ON "Stamp"("countryId");

-- 8. Enforce the foreign key relationship.
ALTER TABLE "Stamp"
ADD CONSTRAINT "Stamp_countryId_fkey"
FOREIGN KEY ("countryId")
REFERENCES "Country"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 9. Remove the old country column only after migration.
ALTER TABLE "Stamp"
DROP COLUMN "country";

COMMIT;