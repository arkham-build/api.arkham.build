import type { Context } from "hono";
import { type Expression, expressionBuilder, sql } from "kysely";
import z from "zod";
import type { DB } from "../db/schema.types.ts";

export const dateRangeSchema = z
  .tuple([z.coerce.date(), z.coerce.date()])
  .optional()
  .default(
    () =>
      [
        new Date("2016-09"),
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      ] as [Date, Date],
  );

export type DateRange = z.infer<typeof dateRangeSchema>;

export function dateRangeFromQuery(c: Context) {
  return c.req.query("date_start")
    ? [c.req.query("date_start"), c.req.query("date_end")]
    : undefined;
}

export function canonicalInvestigatorCodeCond(
  canonicalInvestigatorCode: Expression<string>,
  target: string,
) {
  const eb = expressionBuilder<DB>();
  return eb(
    canonicalInvestigatorCode,
    "=",
    sql<string>`resolve_card(split_part(${target}, '-', 1)) || '-' || resolve_card(split_part(${target}, '-', 2))`,
  );
}

export function inDateRangeConds(
  dateCreation: Expression<Date>,
  dateRange: DateRange,
) {
  const eb = expressionBuilder<DB>();
  return [
    eb(dateCreation, ">=", dateRange[0]),
    eb(dateCreation, "<=", dateRange[1]),
  ];
}

function requiredCardsCond(
  slotsRef: Expression<unknown>,
  requiredCards: string[],
  op: "?|" | "?&",
) {
  const eb = expressionBuilder<DB>();

  const filter = sql<
    string[]
  >`ARRAY[${sql.join(requiredCards.map((c) => sql`resolve_card(${c})`))}]::text[]`;

  return eb(slotsRef, op, filter);
}

export function requiredSlotsCond({
  analyzeSideDecks,
  requiredCards,
  sideSlots,
  slots,
  op = "?|",
}: {
  analyzeSideDecks: boolean;
  requiredCards: string[];
  sideSlots: Expression<unknown>;
  slots: Expression<unknown>;
  op?: "?|" | "?&";
}) {
  const eb = expressionBuilder<DB>();

  const ors = [requiredCardsCond(slots, requiredCards, op)];

  if (analyzeSideDecks) {
    ors.push(requiredCardsCond(sideSlots, requiredCards, op));
  }

  return eb.or(ors);
}
