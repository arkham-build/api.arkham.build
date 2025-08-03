import { Hono } from "hono";
import type { ExpressionBuilder, SqlBool } from "kysely";
import { type Expression, sql } from "kysely";
import z from "zod";
import type { Database } from "../db/db.ts";
import type { DB } from "../db/schema.types.ts";
import { arkhamdbDecklistSchema } from "../db/schemas/arkhamdb-decklist.schema.ts";
import {
  canonicalInvestigatorCodeCond,
  dateRangeFromQuery,
  dateRangeSchema,
  inDateRangeConds,
  notDuplicateCond,
  requiredSlotsCond,
  searchableCond,
} from "../lib/decklists-helpers.ts";
import type { HonoEnv } from "../lib/hono-env.ts";

const searchRequestSchema = z.object({
  analyze_side_decks: z.optional(z.boolean()).default(true),
  canonical_investigator_code: z.optional(z.string()),
  date_range: dateRangeSchema,
  limit: z.optional(z.coerce.number().int().min(1).max(100)).default(10),
  offset: z.optional(z.coerce.number().int().min(0)).default(0),
  required_cards: z.optional(z.array(z.string())),
  sort_by: z
    .optional(
      z.enum(["author_reputation", "date", "like_count", "name", "popularity"]),
    )
    .default("popularity"),
});

const searchResponseSchema = z.object({
  data: z.array(
    arkhamdbDecklistSchema
      .omit({
        description_md: true,
      })
      .extend({
        author: z.string(),
        author_reputation: z.coerce.number().int().min(0),
      }),
  ),
  meta: z.object({
    limit: z.number().int().min(1).max(100),
    offset: z.number().int().min(0),
    total: z.coerce.number().int().min(0),
  }),
});

type SearchRequest = z.infer<typeof searchRequestSchema>;

export function decklistSearchRouter() {
  const routes = new Hono<HonoEnv>();
  routes.get("/", async (c) => {
    const searchRequest = searchRequestSchema.parse({
      analyze_side_decks: c.req.query("analyze_side_decks") !== "false",
      canonical_investigator_code: c.req.query("canonical_investigator_code"),
      required_cards: c.req.queries("card"),
      date_range: dateRangeFromQuery(c),
      limit: c.req.query("limit"),
      offset: c.req.query("offset"),
      sort_by: c.req.query("sort_by"),
    });

    const res = await search(c.get("db"), searchRequest);

    c.header("Cache-Control", "public, max-age=86400, immutable");
    return c.json(res);
  });
  return routes;
}

async function search(db: Database, search: SearchRequest) {
  const conditions = (eb: ExpressionBuilder<DB, "arkhamdb_decklist">) => {
    const conditions: Expression<SqlBool>[] = [
      searchableCond(eb.ref("is_searchable")),
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

    conditions.push(notDuplicateCond(eb.ref("arkhamdb_decklist.is_duplicate")));

    return eb.and(conditions);
  };

  const [countResult, data] = await Promise.all([
    db
      .selectFrom("arkhamdb_decklist")
      .select(sql`count(*)`.as("count"))
      .where(conditions)
      .executeTakeFirst(),
    db
      .selectFrom("arkhamdb_decklist")
      .where(conditions)
      .innerJoin(
        "arkhamdb_user",
        "arkhamdb_user.id",
        "arkhamdb_decklist.user_id",
      )
      .crossJoin(
        db
          .selectFrom("arkhamdb_ranking_cache")
          .select(["max_like_count", "max_reputation"])
          .where("arkhamdb_ranking_cache.id", "=", 1)
          .as("arkhamdb_ranking_cache"),
      )
      .selectAll("arkhamdb_decklist")
      .select([
        "arkhamdb_user.name as author",
        "arkhamdb_user.reputation as author_reputation",
        sql<number>`
          (LN(arkhamdb_decklist.like_count + 1) / LN(arkhamdb_ranking_cache.max_like_count + 1)) * 0.6 +
          EXP(-0.01 * EXTRACT(EPOCH FROM (CURRENT_DATE - arkhamdb_decklist.date_creation)) / 86400) * 0.2 +
          (LN(arkhamdb_user.reputation + 1) / LN(arkhamdb_ranking_cache.max_reputation + 1)) * 0.2
        `.as("ranking_score"),
      ])
      .orderBy("ranking_score", "desc")
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
