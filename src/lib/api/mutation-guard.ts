
import "server-only";

/**
 * Temporary protection for catalogue mutations
 * until authentication and authorisation exist.
 */
export function catalogueMutationsAllowed(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (
    env.NODE_ENV !== "development" &&
    env.NODE_ENV !== "test"
  ) {
    return false;
  }

  if (env.ALLOW_DEV_MUTATIONS !== "true") {
    return false;
  }

  try {
    const url = new URL(env.DATABASE_URL ?? "");

    const isPostgres =
      url.protocol === "postgresql:" ||
      url.protocol === "postgres:";

    const isLocal =
      url.hostname === "127.0.0.1" ||
      url.hostname === "localhost";

    const isDevelopment =
      env.NODE_ENV === "development" &&
      url.port === "5433" &&
      url.pathname === "/stamp_collection";

    const isTesting =
      env.NODE_ENV === "test" &&
      url.port === "5434" &&
      url.pathname === "/stamp_collection_test";

    return (
      isPostgres &&
      isLocal &&
      (isDevelopment || isTesting)
    );
  } catch {
    return false;
  }
}
