import { serve } from "@hono/node-server";
import { appFactory } from "./app.ts";
import { configSchema } from "./lib/config.ts";

const config = configSchema.parse(process.env);

const app = appFactory(config);

serve(
  {
    fetch: app.fetch,
    port: config.PORT,
  },
  (info) => {
    console.log(`Running: ${info.address}:${info.port}`);
  },
);
