import assert from "node:assert";
import { appFactory } from "../app.ts";
import { getDatabase } from "../db/db.ts";
import { configFromEnv } from "../lib/config.ts";

export function getTestApp() {
  const container = globalThis.postgresContainer;
  assert(container, "PostgreSQL container not started.");

  const env = configFromEnv();

  return appFactory({
    ...env,
    DATABASE_URL: container.getConnectionUri(),
  });
}

export function getTestDatabase() {
  const container = globalThis.postgresContainer;
  assert(container, "PostgreSQL container not started.");

  return getDatabase({
    DATABASE_URL: container.getConnectionUri(),
  });
}
