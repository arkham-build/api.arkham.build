import type { Database } from "../db/db.ts";
import type { Config } from "./config.ts";
import type { LogMessage } from "./logger.ts";

export type HonoEnv = {
  Variables: {
    config: Config;
    db: Database;
    logger: (message: LogMessage) => void;
  };
};
