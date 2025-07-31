import type { Database } from "../db/db.ts";
import type { Config } from "./config.ts";

export type HonoEnv = {
  Variables: {
    config: Config;
    db: Database;
  };
};
