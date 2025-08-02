import { HTTPException } from "hono/http-exception";
import { sql } from "kysely";
import type { Database } from "../db/db.ts";
import { getCardById } from "../db/queries/get-card-by-id.ts";
import type { RecommendationsRequest } from "./schemas.ts";

export async function getRecommendations(
  db: Database,
  req: RecommendationsRequest,
) {
  const backInvestigatorCode = req.canonical_investigator_code
    .split("-")
    .at(-1);

  const investigator = backInvestigatorCode
    ? await getCardById(db, backInvestigatorCode)
    : undefined;

  if (investigator?.type_code !== "investigator") {
    throw new HTTPException(400, {
      cause: new Error(
        `canonical_investigator_code ${req.canonical_investigator_code} does not match an investigator card.`,
      ),
    });
  }

  const { decksAnalyzed, recommendations } = await (req.analysis_algorithm ===
  "absolute percentage"
    ? getRecommendationsByAbsolutePercentage(db, req)
    : getRecommendationsByPercentileRank(db, req));

  return {
    decks_analyzed: decksAnalyzed,
    recommendations: recommendations,
  };
}

async function getRecommendationsByAbsolutePercentage(
  db: Database,
  req: RecommendationsRequest,
) {
  const { analyze_side_decks, canonical_investigator_code } = req;

  type InclusionResult = {
    card_code: string;
    decks_analyzed: number;
    decks_with_card: number;
  };

  const inclusionsQueryResult = await sql<InclusionResult>`
    WITH investigator_decks AS (
      SELECT
        id,
        slots,
        side_slots
      FROM
        arkhamdb_decklist
      WHERE
        canonical_investigator_code = ${canonical_investigator_code}
        AND ${deckFilterConditions(req)} ${requiredCardsConditions(req)}
    ),
    deck_card_usage AS (
      SELECT
        id,
        jsonb_object_keys(slots) AS card_code
      FROM
        investigator_decks
      UNION
      SELECT
        id,
        jsonb_object_keys(side_slots) AS card_code
      FROM
        investigator_decks
      WHERE
        side_slots IS NOT NULL
        AND ${analyze_side_decks}
    )
    SELECT
      deck_card_usage.card_code,
      (
        SELECT
          COUNT(*)::int
        FROM
          investigator_decks
      ) AS decks_analyzed,
      COUNT(DISTINCT deck_card_usage.id)::int AS decks_with_card
      FROM
        deck_card_usage
      GROUP BY
        deck_card_usage.card_code;
  `.execute(db);

  const inclusions = inclusionsQueryResult.rows;

  const recommendations = inclusions.reduce((acc, inc) => {
    const recommendation =
      Math.round((inc.decks_with_card / inc.decks_analyzed) * 100_00) / 100;

    if (recommendation > 0.75) {
      acc.push({
        card_code: inc.card_code,
        recommendation,
      });
    }

    return acc;
  }, [] as unknown[]);

  return formatRecommendations(inclusions[0]?.decks_analyzed, recommendations);
}

async function getRecommendationsByPercentileRank(
  db: Database,
  req: RecommendationsRequest,
) {
  type InclusionResult = {
    canonical_investigator_code: string;
    card_code: string;
    decks_analyzed: number;
    decks_with_cards: number;
    decks_per_investigator: number;
    percentile_rank: number;
  };

  const { analyze_side_decks, canonical_investigator_code } = req;

  const inclusionsQueryResult = await sql<InclusionResult>`
    WITH
      deck_scope AS (
        SELECT
          id,
          slots,
          side_slots,
          canonical_investigator_code
        FROM
          arkhamdb_decklist
        WHERE
          ${deckFilterConditions(req)} ${requiredCardsConditions(req)}
      ),
      by_investigator AS (
        SELECT
          canonical_investigator_code,
          COUNT(*)::numeric AS total_decks,
          SUM(COUNT(*)) OVER() AS decks_analyzed
        FROM
          deck_scope
        GROUP BY
          canonical_investigator_code
      ),
      by_card_used AS (
        SELECT
          card_code,
          COUNT(*)::numeric AS deck_count,
          canonical_investigator_code
        FROM
          deck_scope
          CROSS JOIN LATERAL (
            SELECT
              unnest(
                array(
                  SELECT
                    jsonb_object_keys(slots)
                ) || CASE
                  WHEN ${analyze_side_decks} AND side_slots IS NOT NULL THEN array(
                    SELECT
                      jsonb_object_keys(side_slots)
                  )
                  ELSE ARRAY[]::TEXT[]
                END
              ) AS card_code
          ) cards
        GROUP BY
          canonical_investigator_code,
          card_code
      ),
      percentiles AS (
        SELECT
          by_card_used.card_code,
          by_card_used.canonical_investigator_code,
          by_investigator.total_decks :: int AS total_decks,
          by_investigator.decks_analyzed :: int AS decks_analyzed,
          ROUND((by_card_used.deck_count / by_investigator.total_decks) * 100, 2) :: float AS usage_percentage,
          ROUND(
            PERCENT_RANK() OVER (
              PARTITION BY
                by_card_used.card_code
              ORDER BY
                (by_card_used.deck_count / by_investigator.total_decks)
            )::NUMERIC * 100,
            2
          ) :: float AS percentile_rank
        FROM
          by_card_used
          JOIN by_investigator ON by_card_used.canonical_investigator_code = by_investigator.canonical_investigator_code
        WHERE
          (by_card_used.deck_count / by_investigator.total_decks) > 0.0075
          AND by_investigator.total_decks > 10
      )
    SELECT
      *
    FROM
      percentiles
    WHERE
      canonical_investigator_code = ${canonical_investigator_code}
  `.execute(db);

  const inclusions = inclusionsQueryResult.rows;

  const recommendations = inclusions.map((inc) => ({
    card_code: inc.card_code,
    recommendation: inc.percentile_rank,
  }));

  return formatRecommendations(inclusions[0]?.decks_analyzed, recommendations);
}

function deckFilterConditions(req: RecommendationsRequest) {
  const { date_range } = req;

  return sql`
    NOT EXISTS (
      SELECT 1 FROM arkhamdb_decklist_duplicate
      WHERE arkhamdb_decklist_duplicate.id = arkhamdb_decklist.id
    )
    AND date_creation >= ${date_range[0]}
    AND date_creation <= ${date_range[1]}
    AND (
      like_count > 0
      OR (
        next_deck IS NULL
        AND previous_deck IS null
      )
    )
  `;
}

function formatRecommendations(
  decksAnalyzed: number | undefined,
  recommendations: unknown[],
) {
  const empty = !recommendations.length || !decksAnalyzed;

  return empty
    ? { decksAnalyzed: 0, recommendations: [] }
    : { decksAnalyzed, recommendations };
}

function requiredCardsConditions(req: RecommendationsRequest) {
  const { analyze_side_decks, required_cards } = req;

  if (!required_cards.length) return sql``;

  const requiredCardsArray = sql`ARRAY[${sql.join(required_cards.map((c) => sql`resolve_card(${c})`))}]::text[]`;

  return analyze_side_decks
    ? sql`AND (slots ?& ${requiredCardsArray} OR side_slots ?& ${requiredCardsArray})`
    : sql`AND (slots ?& ${requiredCardsArray})`;
}
