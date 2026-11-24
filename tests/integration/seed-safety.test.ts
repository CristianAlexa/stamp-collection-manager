import assert from "node:assert/strict";
import { test } from "node:test";

import {
  assertSafeSeedEnvironment,
} from "../../prisma/seeds/seed-safety";

const developmentUrl =
  "postgresql://stamp_app:password@127.0.0.1:5433/stamp_collection";

const testUrl =
  "postgresql://stamp_test:password@127.0.0.1:5434/stamp_collection_test";

/**
 * Temporarily changes environment variables and
 * restores them after the assertion.
 */
function withEnvironment(
  nodeEnv: string,
  allowSeed: string,
  callback: () => void,
): void {
  // Use Node.js environment types to allow temporary
  // changes during isolated testing.
  const env = process.env as Record<
    string,
    string | undefined
  >;

  const previousNodeEnv = env.NODE_ENV;
  const previousAllowSeed = env.ALLOW_DEV_SEED;

  try {
    env.NODE_ENV = nodeEnv;
    env.ALLOW_DEV_SEED = allowSeed;

    callback();
  } finally {
    // Restore the original NODE_ENV value.
    if (previousNodeEnv === undefined) {
      delete env.NODE_ENV;
    } else {
      env.NODE_ENV = previousNodeEnv;
    }

    // Restore the original seed permission.
    if (previousAllowSeed === undefined) {
      delete env.ALLOW_DEV_SEED;
    } else {
      env.ALLOW_DEV_SEED = previousAllowSeed;
    }
  }
}

test("allows the approved development database", () => {
  withEnvironment("development", "true", () => {
    assert.doesNotThrow(() => {
      assertSafeSeedEnvironment(developmentUrl);
    });
  });
});

test("allows the isolated test database", () => {
  withEnvironment("test", "true", () => {
    assert.doesNotThrow(() => {
      assertSafeSeedEnvironment(testUrl);
    });
  });
});

test("rejects production mode", () => {
  withEnvironment("production", "true", () => {
    assert.throws(
      () => assertSafeSeedEnvironment(developmentUrl),
      /prohibited in production/,
    );
  });
});

test("rejects seeding without explicit permission", () => {
  withEnvironment("development", "false", () => {
    assert.throws(
      () => assertSafeSeedEnvironment(developmentUrl),
      /ALLOW_DEV_SEED=true/,
    );
  });
});

test("rejects a remote database", () => {
  withEnvironment("development", "true", () => {
    assert.throws(
      () =>
        assertSafeSeedEnvironment(
          "postgresql://user:password@db.example.com:5433/stamp_collection",
        ),
      /approved local databases/,
    );
  });
});

test("rejects unknown local database names", () => {
  withEnvironment("development", "true", () => {
    assert.throws(
      () =>
        assertSafeSeedEnvironment(
          "postgresql://user:password@127.0.0.1:5433/production",
        ),
      /approved local databases/,
    );
  });
});

test("rejects an incorrect database port", () => {
  withEnvironment("development", "true", () => {
    assert.throws(
      () =>
        assertSafeSeedEnvironment(
          "postgresql://user:password@127.0.0.1:5432/stamp_collection",
        ),
      /approved local databases/,
    );
  });
});