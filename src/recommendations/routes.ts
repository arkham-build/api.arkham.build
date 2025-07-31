import { Hono } from "hono";
import type { HonoEnv } from "../lib/hono-env.ts";
import { zodValidator } from "../lib/validation.ts";
import { getRecommendations } from "./queries.ts";
import {
  recommendationsRequestSchema,
  recommendationsResponseSchema,
} from "./schemas.ts";

const routes = new Hono<HonoEnv>();

routes.post(
  "/",
  zodValidator("json", recommendationsRequestSchema),
  async (c) => {
    const recommendations = await getRecommendations(
      c.get("db"),
      c.req.valid("json"),
    );

    const res = recommendationsResponseSchema.parse({
      data: { recommendations },
    });

    return c.json(res);
  },
);

export default routes;
