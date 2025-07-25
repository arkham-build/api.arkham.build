import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimitMiddleware } from "./lib/body-limit.ts";
import config from "./lib/config.ts";
import { corsMiddleware } from "./lib/cors.ts";
import { errorHandler } from "./lib/errors.ts";
import recommendations from "./recommendations.ts";

const app = new Hono();

app.use(secureHeaders());
app.use(bodyLimitMiddleware());
app.use(corsMiddleware());

app.route("/recommendations", recommendations);

app.onError(errorHandler);

serve(
  {
    fetch: app.fetch,
    port: config.PORT,
  },
  (info) => {
    console.log(`Running: ${info.address}:${info.port}`);
  },
);
