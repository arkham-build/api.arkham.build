import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { dateRangeFromQuery } from "../../lib/decklists-helpers.ts";
import type { HonoEnv } from "../../lib/hono-env.ts";
import { statusText } from "../../lib/http-status.ts";
import {
  decklistMetaResponseSchema,
  getDecklistMeta,
} from "./decklist-meta.ts";
import { search, searchRequestSchema, searchResponseSchema } from "./search.ts";

const routes = new Hono<HonoEnv>();

routes.use("*", async (c, next) => {
  await next();
  if (c.res.status < 300) {
    c.header("Cache-Control", "public, max-age=86400, immutable");
  }
});

routes.get("/search", async (c) => {
  const searchReq = searchRequestSchema.safeParse({
    analyze_side_decks: c.req.query("side_decks") !== "false",
    author_name: c.req.query("author"),
    canonical_investigator_code: c.req.query("investigator"),
    date_range: dateRangeFromQuery(c),
    excluded_cards: c.req.queries("without"),
    investigator_faction: c.req.query("investigator_faction"),
    name: c.req.query("name"),
    limit: c.req.query("limit"),
    offset: c.req.query("offset"),
    required_cards: c.req.queries("with"),
    sort_by: c.req.query("sort_by"),
    sort_dir: c.req.query("sort_dir"),
  });

  if (!searchReq.success) {
    throw new HTTPException(400, {
      message: statusText(400),
      cause: searchReq.error,
    });
  }

  const res = await search(c.get("db"), searchReq.data);

  return c.json(searchResponseSchema.parse(res));
});

routes.get("/:id/meta", async (c) => {
  const id = c.req.param("id");
  const meta = await getDecklistMeta(c.get("db"), Number(id));

  if (!meta) {
    throw new HTTPException(404, {
      message: statusText(404),
      cause: `Decklist with ID ${id} not found.`,
    });
  }

  return c.json(decklistMetaResponseSchema.parse(meta));
});

export default routes;
