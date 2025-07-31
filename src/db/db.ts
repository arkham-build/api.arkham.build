import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Config } from "../lib/config.ts";
import type { DB } from "./schema.types.ts"; // this is the Database interface we defined earlier

export type Database = Kysely<DB>;

export function getDatabase(config: Pick<Config, "DATABASE_URL">): Database {
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: config.DATABASE_URL,
      }),
    }),
  });
}
