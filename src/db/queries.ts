import assert from "node:assert";
import type { Selectable } from "kysely";
import { db } from "./db.ts";
import type { Card } from "./schema.types.ts";

export async function getCardById(
  code: string,
  tabooSetId?: number,
): Promise<Selectable<Card>> {
  const id = tabooSetId ? `${code}-${tabooSetId}` : code;

  const card = await db
    .selectFrom("card")
    .selectAll()
    .where("id", "=", id)
    .limit(1)
    .executeTakeFirst();

  assert(card, `Card with code ${code} not found in database.`);

  return card;
}
