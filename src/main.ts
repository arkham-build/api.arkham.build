import { serve } from "@hono/node-server";
import { appFactory } from "./app.ts";
import { connectionString, getDatabase } from "./db/db.ts";
import { configSchema } from "./lib/config.ts";
import { type LogMessage, log } from "./lib/logger.ts";

const config = configSchema.parse(process.env);
const database = getDatabase(connectionString(config));

const app = appFactory(config, database);

serve(
  {
    fetch: app.fetch,
    port: config.PORT,
  },
  (info) => {
    log({
      level: "info",
      msg: "Application started",
      details: {
        address: info.address,
        port: info.port,
      },
    } as LogMessage);
  },
);
