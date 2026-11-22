/**
 * Allows development seeding only against our
 * explicitly recognised local databases.
 */
export function assertSafeSeedEnvironment(
  connectionString: string,
): void {
  // Never execute sample seeding in production mode.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Database seeding is prohibited in production.",
    );
  }

  // Require explicit permission to seed.
  if (process.env.ALLOW_DEV_SEED !== "true") {
    throw new Error(
      "Development seeding requires ALLOW_DEV_SEED=true.",
    );
  }

  // Parse the database connection URL.
  const url = new URL(connectionString);

  const isPostgres =
    url.protocol === "postgresql:" ||
    url.protocol === "postgres:";

  const isLocal =
    url.hostname === "127.0.0.1" ||
    url.hostname === "localhost";

  const isDevelopment =
    url.port === "5433" &&
    url.pathname === "/stamp_collection";

  const isTesting =
    url.port === "5434" &&
    url.pathname === "/stamp_collection_test";

  // Only allow our known local database configurations.
  if (
    !isPostgres ||
    !isLocal ||
    (!isDevelopment && !isTesting)
  ) {
    throw new Error(
      "Seeding is restricted to approved local databases.",
    );
  }
}