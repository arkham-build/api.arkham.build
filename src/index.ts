import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimitMiddleware } from "./lib/body-limit.ts";
import { corsMiddleware } from "./lib/cors.ts";
import { ConfigSchema } from "./schemas/config.schema.ts";

const config = ConfigSchema.parse(process.env);

const app = new Hono();

app.use(secureHeaders());
app.use(bodyLimitMiddleware());
app.use(corsMiddleware(config));

app.get("/", (c) => {
  return c.text("Hello, World!");
});

serve(
  {
    fetch: app.fetch,
    port: config.PORT,
  },
  (info) => {
    console.log(`Running: ${info.address}:${info.port}`);
  },
);
