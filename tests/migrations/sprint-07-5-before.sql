-- Sprint 07.5 migration regression fixtures.
-- Execute against a temporary database containing
-- the original Week 6 database structure.

BEGIN;

-- Create a fictional issuing country.
INSERT INTO "Country" (
    "id",
    "name",
    "code",
    "updatedAt"
)
VALUES (
    'migration-country',
    'Migration Test Country',
    'MT',
    NOW()
);

-- Create a historical currency.
INSERT INTO "Currency" (
    "id",
    "code",
    "name",
    "symbol",
    "updatedAt"
)
VALUES (
    'migration-currency',
    'MT-OLD',
    'Historical Test Currency',
    'd',
    NOW()
);

-- Create stamps covering different denomination formats.
INSERT INTO "Stamp" (
    "id",
    "name",
    "year",
    "countryId",
    "denomination",
    "faceValue",
    "currencyId",
    "updatedAt"
)
VALUES
    (
        'migration-001',
        'Printed denomination',
        1840,
        'migration-country',
        '1d',
        1,
        'migration-currency',
        NOW()
    ),
    (
        'migration-002',
        'Historical fraction',
        1840,
        'migration-country',
        '½d',
        0.5,
        'migration-currency',
        NOW()
    ),
    (
        'migration-003',
        'Service denomination',
        1900,
        'migration-country',
        '1st Class',
        NULL,
        NULL,
        NOW()
    ),
    (
        'migration-004',
        'Numeric fallback',
        1900,
        'migration-country',
        NULL,
        2.5,
        'migration-currency',
        NOW()
    ),
    (
        'migration-005',
        'Compound denomination',
        1900,
        'migration-country',
        '2s 6d',
        NULL,
        NULL,
        NOW()
    ),
    (
        'migration-006',
        'Unknown denomination',
        1900,
        'migration-country',
        NULL,
        NULL,
        NULL,
        NOW()
    ),
    (
        'migration-007',
        'Currency only',
        1900,
        'migration-country',
        NULL,
        NULL,
        'migration-currency',
        NOW()
    ),
    (
        'migration-008',
        'Whitespace denomination',
        1900,
        'migration-country',
        '   ',
        3,
        'migration-currency',
        NOW()
    );

-- Create reusable colour definitions in the old schema.
INSERT INTO "Colour" (
    "id",
    "name",
    "updatedAt"
)
VALUES
    ('migration-black', 'Black', NOW()),
    ('migration-red', 'Rose Red', NOW()),
    ('migration-carmine', 'Deep Carmine', NOW());

-- Assign multiple colours to one stamp.
INSERT INTO "StampColour" (
    "stampId",
    "colourId"
)
VALUES
    ('migration-001', 'migration-black'),
    ('migration-001', 'migration-red'),
    ('migration-002', 'migration-black');

-- Create variants with and without explicit colour overrides.
INSERT INTO "StampVariant" (
    "id",
    "name",
    "stampId",
    "updatedAt"
)
VALUES
    (
        'migration-variant-001',
        'Inherited colour',
        'migration-001',
        NOW()
    ),
    (
        'migration-variant-002',
        'Overridden colour',
        'migration-001',
        NOW()
    );

INSERT INTO "VariantColour" (
    "variantId",
    "colourId"
)
VALUES (
    'migration-variant-002',
    'migration-carmine'
);

COMMIT;