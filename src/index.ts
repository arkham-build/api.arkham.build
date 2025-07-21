import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimitMiddleware } from "./lib/body-limit.ts";
import config from "./lib/config.ts";
import { corsMiddleware } from "./lib/cors.ts";

const app = new Hono();

app.use(secureHeaders());
app.use(bodyLimitMiddleware());
app.use(corsMiddleware());

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
