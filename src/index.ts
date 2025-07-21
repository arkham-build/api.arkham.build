import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { ConfigSchema } from "./schemas/config.schema.ts";

const config = ConfigSchema.parse(process.env);

const app = new Hono();

serve(
  {
    fetch: app.fetch,
    port: config.PORT,
  },
  (info) => {
    console.log(`Running: ${info.address}:${info.port}`);
  },
);
