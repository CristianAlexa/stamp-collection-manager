-- Verify that Sprint 07.5 preserves historical data.
-- Any failed assertion stops the regression suite.

DO $$
BEGIN
    -- Verify all eight historical denominations.
    -- IS DISTINCT FROM handles NULL comparisons safely.
    IF EXISTS (
        SELECT 1
        FROM (
            VALUES
                ('migration-001', '1d'),
                ('migration-002', '½d'),
                ('migration-003', '1st Class'),
                ('migration-004', '2.5 MT-OLD'),
                ('migration-005', '2s 6d'),
                ('migration-006', NULL::TEXT),
                ('migration-007', 'MT-OLD'),
                ('migration-008', '3 MT-OLD')
        ) AS expected(id, face_value)
        LEFT JOIN "Stamp" AS s
            ON s."id" = expected.id
        WHERE s."id" IS NULL
           OR s."faceValue"
              IS DISTINCT FROM expected.face_value
    ) THEN
        RAISE EXCEPTION
            'FAIL: Historical face values were not preserved';
    END IF;

    RAISE NOTICE
        'PASS: All eight historical face values preserved';

    -- Verify multiple colours and missing colour information.
    IF EXISTS (
        SELECT 1
        FROM (
            VALUES
                ('migration-001', 'Black, Rose Red'),
                ('migration-002', 'Black'),
                ('migration-003', NULL::TEXT)
        ) AS expected(id, colour)
        LEFT JOIN "Stamp" AS s
            ON s."id" = expected.id
        WHERE s."id" IS NULL
           OR s."colour"
              IS DISTINCT FROM expected.colour
    ) THEN
        RAISE EXCEPTION
            'FAIL: Stamp colours were not preserved';
    END IF;

    RAISE NOTICE
        'PASS: Stamp colours preserved';

    -- Verify explicit and inherited variant colours.
    IF EXISTS (
        SELECT 1
        FROM (
            VALUES
                ('migration-variant-001', NULL::TEXT),
                ('migration-variant-002', 'Deep Carmine')
        ) AS expected(id, colour)
        LEFT JOIN "StampVariant" AS v
            ON v."id" = expected.id
        WHERE v."id" IS NULL
           OR v."colour"
              IS DISTINCT FROM expected.colour
    ) THEN
        RAISE EXCEPTION
            'FAIL: Variant colours were not preserved';
    END IF;

    RAISE NOTICE
        'PASS: Variant colours preserved';

    -- Verify that obsolete colour tables were removed.
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN (
            'Colour',
            'StampColour',
            'VariantColour'
        )
    ) THEN
        RAISE EXCEPTION
            'FAIL: Obsolete colour tables still exist';
    END IF;

    RAISE NOTICE
        'PASS: Obsolete colour tables removed';

    -- Verify the new country fields.
    IF (
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Country'
        AND column_name IN ('flagUrl', 'description')
        AND data_type = 'text'
        AND is_nullable = 'YES'
    ) <> 2 THEN
        RAISE EXCEPTION
            'FAIL: Country metadata fields are incorrect';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM "Country"
        WHERE "id" = 'migration-country'
        AND "flagUrl" IS NULL
        AND "description" IS NULL
    ) THEN
        RAISE EXCEPTION
            'FAIL: Existing country record not preserved';
    END IF;

    RAISE NOTICE
        'PASS: Country metadata fields verified';

    -- Verify that faceValue is now nullable text.
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Stamp'
        AND column_name = 'faceValue'
        AND data_type = 'text'
        AND is_nullable = 'YES'
    ) THEN
        RAISE EXCEPTION
            'FAIL: Incorrect face value column type';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Stamp'
        AND column_name IN (
            'denomination',
            'currencyId',
            'faceValueText'
        )
    ) THEN
        RAISE EXCEPTION
            'FAIL: Obsolete face value columns still exist';
    END IF;

    RAISE NOTICE
        'PASS: Face value schema verified';

    -- Verify that financial currency relationships remain.
    IF (
        SELECT COUNT(*)
        FROM pg_constraint
        WHERE contype = 'f'
        AND confrelid = '"Currency"'::regclass
        AND conrelid IN (
            '"CatalogueValuation"'::regclass,
            '"CollectionItem"'::regclass
        )
    ) <> 3 THEN
        RAISE EXCEPTION
            'FAIL: Financial currency relationships changed';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM "Currency"
        WHERE "id" = 'migration-currency'
        AND "code" = 'MT-OLD'
    ) THEN
        RAISE EXCEPTION
            'FAIL: Original currency record not preserved';
    END IF;

    RAISE NOTICE
        'PASS: Financial currency relationships preserved';

    -- Verify the Sprint 07.5 database table count.
    IF (
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name <> '_prisma_migrations'
    ) <> 23 THEN
        RAISE EXCEPTION
            'FAIL: Unexpected application table count';
    END IF;

    RAISE NOTICE
        'PASS: All 23 application tables verified';

    RAISE NOTICE
        'SUCCESS: Sprint 07.5 migration regression passed';
END $$;
