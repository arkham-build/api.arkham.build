import { type Context, Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ExpressionBuilder, SqlBool } from "kysely";
import { type Expression, sql } from "kysely";
import z from "zod";
import type { Database } from "../db/db.ts";
import type { Card, DB } from "../db/schema.types.ts";
import { arkhamdbDecklistSchema } from "../db/schemas/arkhamdb-decklist.schema.ts";
import {
  canonicalInvestigatorCodeCond,
  dateRangeFromQuery,
  dateRangeSchema,
  inDateRangeConds,
  requiredSlotsCond,
} from "../lib/decklists-helpers.ts";
import type { HonoEnv } from "../lib/hono-env.ts";
import { statusText } from "../lib/http-status.ts";

const searchRequestSchema = z.object({
  analyze_side_decks: z.optional(z.boolean()).default(true),
  author_name: z.optional(z.string().max(255)),
  canonical_investigator_code: z.optional(z.string()),
  date_range: dateRangeSchema,
  excluded_cards: z.optional(z.array(z.string())),
  investigator_faction: z.optional(z.string()),
  limit: z.optional(z.coerce.number().int().min(1).max(100)).default(10),
  name: z.optional(z.string().max(255)),
  offset: z.optional(z.coerce.number().int().min(0)).default(0),
  required_cards: z.optional(z.array(z.string())),
  sort_by: z
    .optional(z.enum(["user_reputation", "date", "likes", "popularity"]))
    .default("popularity"),
  sort_dir: z.optional(z.enum(["asc", "desc"])).default("desc"),
});

function searchFromQuery(c: Context) {
  return {
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
  };
}

const searchResponseSchema = z.object({
  meta: z.object({
    limit: z.number().int().min(1).max(100),
    offset: z.number().int().min(0),
    total: z.coerce.number().int().min(0),
  }),
  data: z.array(
    arkhamdbDecklistSchema
      .omit({
        description_md: true,
      })
      .extend({
        user_name: z.string(),
        user_reputation: z.coerce.number().int().min(0),
      }),
  ),
});

type SearchRequest = z.infer<typeof searchRequestSchema>;

export function decklistSearchRouter() {
  const routes = new Hono<HonoEnv>();
  routes.get("/", async (c) => {
    const searchReq = searchRequestSchema.safeParse(searchFromQuery(c));
    if (!searchReq.success) {
      throw new HTTPException(400, {
        message: statusText(400),
        cause: searchReq.error,
      });
    }

    const res = await search(c.get("db"), searchReq.data);
    c.header("Cache-Control", "public, max-age=86400, immutable");

    return c.json(res);
  });
  return routes;
}

async function search(db: Database, search: SearchRequest) {
  const conditions = (
    eb: ExpressionBuilder<
      DB & {
        investigator: Card;
      },
      "arkhamdb_decklist" | "arkhamdb_user" | "investigator"
    >,
  ) => {
    const conditions: Expression<SqlBool>[] = [
      eb(eb.ref("is_duplicate"), "!=", eb.lit(true)),
      eb(eb.ref("is_searchable"), "=", eb.lit(true)),
    ];

    if (search.canonical_investigator_code) {
      conditions.push(
        canonicalInvestigatorCodeCond(
          eb.ref("arkhamdb_decklist.canonical_investigator_code"),
          search.canonical_investigator_code,
        ),
      );
    }

    if (search.date_range) {
      conditions.push(
        ...inDateRangeConds(
          eb.ref("arkhamdb_decklist.date_creation"),
          search.date_range,
        ),
      );
    }

    if (search.required_cards) {
      conditions.push(
        requiredSlotsCond({
          slots: eb.ref("arkhamdb_decklist.slots"),
          sideSlots: eb.ref("arkhamdb_decklist.side_slots"),
          analyzeSideDecks: search.analyze_side_decks,
          requiredCards: search.required_cards,
          op: "?&",
        }),
      );
    }

    if (search.excluded_cards) {
      conditions.push(
        eb.not(
          requiredSlotsCond({
            slots: eb.ref("arkhamdb_decklist.slots"),
            sideSlots: eb.ref("arkhamdb_decklist.side_slots"),
            analyzeSideDecks: search.analyze_side_decks,
            requiredCards: search.excluded_cards,
            op: "?|",
          }),
        ),
      );
    }

    if (search.author_name) {
      conditions.push(
        eb(eb.ref("arkhamdb_user.name"), "ilike", `%${search.author_name}%`),
      );
    }

    if (search.name) {
      conditions.push(
        eb(eb.ref("arkhamdb_decklist.name"), "ilike", `%${search.name}%`),
      );
    }

    if (search.investigator_faction) {
      conditions.push(
        eb(
          eb.ref("investigator.faction_code"),
          "=",
          search.investigator_faction,
        ),
      );
    }

    return eb.and(conditions);
  };

  const baseQuery = db
    .selectFrom("arkhamdb_decklist")
    .innerJoin("arkhamdb_user", "arkhamdb_user.id", "arkhamdb_decklist.user_id")
    .innerJoin(
      "card as investigator",
      "investigator.id",
      "arkhamdb_decklist.investigator_code",
    )
    .where(conditions);

  const [countResult, data] = await Promise.all([
    baseQuery.select(sql`count(*)`.as("count")).executeTakeFirst(),
    baseQuery
      .crossJoin(
        db
          .selectFrom("arkhamdb_ranking_cache")
          .select(["max_like_count", "max_reputation"])
          .where("arkhamdb_ranking_cache.id", "=", 1)
          .as("arkhamdb_ranking_cache"),
      )
      .selectAll("arkhamdb_decklist")
      .select([
        "arkhamdb_user.name as user_name",
        "arkhamdb_user.reputation as user_reputation",
        "investigator.faction_code as investigator_faction_code",
        sql<number>`
          (LN(arkhamdb_decklist.like_count + 1) / LN(arkhamdb_ranking_cache.max_like_count + 1)) * 0.6 +
          EXP(-0.01 * EXTRACT(EPOCH FROM (CURRENT_DATE - arkhamdb_decklist.date_creation)) / 86400) * 0.2 +
          (LN(arkhamdb_user.reputation + 1) / LN(arkhamdb_ranking_cache.max_reputation + 1)) * 0.2
        `.as("ranking_score"),
      ])
      .orderBy(
        (eb) => {
          const { sort_by } = search;

          if (sort_by === "popularity") {
            return sql.ref("ranking_score");
          } else if (sort_by === "user_reputation") {
            return eb.ref("arkhamdb_user.reputation");
          } else if (sort_by === "date") {
            return eb.ref("arkhamdb_decklist.date_creation");
          }

          return eb.ref("arkhamdb_decklist.like_count");
        },
        (eb) => (search.sort_dir === "asc" ? eb.asc() : eb.desc()),
      )
      .limit(search.limit)
      .execute(),
  ]);

  return searchResponseSchema.parse({
    data,
    meta: {
      limit: search.limit,
      offset: search.offset,
      total: countResult?.count || data.length,
    },
  });
}
