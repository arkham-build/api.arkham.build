import { Hono } from "hono";
import type { HonoEnv } from "../lib/hono-env.ts";
import { getRecommendations } from "./queries.ts";
import {
  recommendationsRequestSchema,
  recommendationsResponseSchema,
} from "./schemas.ts";

const routes = new Hono<HonoEnv>();

routes.get("/:canonical_investigator_code", async (c) => {
  const dateRange = c.req.query("date_range_start")
    ? [c.req.query("date_range_start"), c.req.query("date_range_end")]
    : undefined;

  const req = recommendationsRequestSchema.parse({
    canonical_investigator_code: c.req.param("canonical_investigator_code"),
    date_range: dateRange,
    analyze_side_decks: c.req.query("analyze_side_decks") !== "false",
    analysis_algorithm: c.req.query("algo"),
    required_cards: c.req.queries("card"),
  });

  const recommendations = await getRecommendations(c.get("db"), req);

  const res = recommendationsResponseSchema.parse({
    data: { recommendations },
  });

  c.header("Cache-Control", "public, max-age=86400, immutable");

  return c.json(res);
});

export default routes;
