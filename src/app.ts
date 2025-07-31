import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { getDatabase } from "./db/db.ts";
import { bodyLimitMiddleware } from "./lib/body-limit.ts";
import type { Config } from "./lib/config.ts";
import { corsMiddleware } from "./lib/cors.ts";
import { errorHandler } from "./lib/errors.ts";
import type { HonoEnv } from "./lib/hono-env.ts";
import recommendations from "./recommendations/routes.ts";

export function appFactory(config: Config) {
  const database = getDatabase(config);

  const app = new Hono<HonoEnv>().basePath("/v2");

  app.use(secureHeaders());
  app.use(bodyLimitMiddleware());
  app.use(corsMiddleware(config));

  app.use((c, next) => {
    c.set("db", database);
    c.set("config", config);
    return next();
  });

  const pub = new Hono<HonoEnv>();
  pub.route("/recommendations", recommendations);
  app.route("/public", pub);

  app.onError(errorHandler);

  return app;
}
