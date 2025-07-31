/** biome-ignore-all lint/suspicious/noExplicitAny: not relevant for script */
import type { Insertable } from "kysely";
import { getDatabase } from "../db/db.ts";
import type { ArkhamdbDecklist } from "../db/schema.types.ts";
import { chunkArray } from "../lib/chunk-array.ts";
import { configFromEnv } from "../lib/config.ts";

const config = configFromEnv();
const db = getDatabase(config);

await ingest();
await db.destroy();

async function ingest() {
  console.time("fetching-decks");
  const [authors, rawDecklists, stats] = await Promise.all([
    fetchJsonFile<ApiAuthor[]>("authors"),
    fetchJsonFile<ApiDecklist[]>("decklists"),
    fetchJsonFile<ApiStats[]>("decklist_stats"),
  ]);
  console.timeEnd("fetching-decks");

  console.time("recreating-data");
  const statsByDecklistId = new Map(stats.map((s) => [s.decklist_id, s]));

  const users = authors.map((author) => ({
    id: author.id,
    name: author.name,
    reputation: author.reputation,
  }));

  const decklists = rawDecklists
    .map((_deck) => {
      const meta = JSON.parse(_deck.meta || "{}");
      const backCode = meta.alternate_back || _deck.investigator_code;
      const frontCode = meta.alternate_front || _deck.investigator_code;
      const deck = _deck as unknown as Insertable<ArkhamdbDecklist>;
      deck.meta = meta;
      deck.like_count = statsByDecklistId.get(deck.id)?.likes ?? 0;
      deck.canonical_investigator_code = `${frontCode}-${backCode}`;
      deck.slots = parseSlots(_deck.slots) as Record<string, number>;
      deck.side_slots = parseSlots(_deck.sideSlots);
      deck.ignore_deck_limit_slots = parseSlots(_deck.ignoreDeckLimitSlots);

      delete (deck as any).sideSlots;
      delete (deck as any).ignoreDeckLimitSlots;

      return deck;
    })
    .sort((a, b) => (b.like_count as number) - (a.like_count as number));

  const duplicates = await getDuplicateDecks(decklists);

  await db.transaction().execute(async (tx) => {
    await tx.deleteFrom("arkhamdb_decklist_duplicate").execute();
    await tx.deleteFrom("arkhamdb_decklist").execute();
    await tx.deleteFrom("arkhamdb_user").execute();

    for (const chunk of chunkArray(users, 10000)) {
      await tx.insertInto("arkhamdb_user").values(chunk).execute();
    }

    for (const chunk of chunkArray(decklists, 2500)) {
      await tx
        .insertInto("arkhamdb_decklist")
        .values(serialize(chunk))
        .execute();
    }

    for (const chunk of chunkArray(duplicates, 25000)) {
      await tx
        .insertInto("arkhamdb_decklist_duplicate")
        .values(chunk)
        .execute();
    }
  });

  console.timeEnd("recreating-data");
}

type Duplicate = {
  duplicate_of: number;
  id: number;
};

type ApiAuthor = {
  date_ingested: string;
  name: string;
  reputation: number;
  id: number;
};

type ApiStats = {
  decklist_id: number;
  likes: number;
};

type ApiDecklist = {
  like_count: number;
  meta: string;
  canonical_investigator_code: string;
  investigator_code: string;
  id: number;
  slots: string;
  sideSlots: string | null;
  ignoreDeckLimitSlots: string | null;
};

async function fetchJsonFile<T>(name: string) {
  const res = await fetch(
    `${config.INGEST_URL_ARKHAMDB_DECKLISTS}/${name}.json`,
  );
  if (!res.ok) throw new Error(`Failed to fetch ${name}: ${res.statusText}`);
  return res.json() as T;
}

function parseSlots(
  slots: string | null | undefined,
): Record<string, number> | null {
  if (!slots) return null;
  try {
    const val = JSON.parse(slots);
    if (!val || Array.isArray(val)) return null;
    return val;
  } catch {
    return null;
  }
}

async function getWeaknessCodes() {
  const res = await db
    .selectFrom("card")
    .select("code")
    .where("subtype_code", "!=", null)
    .execute();

  return new Set(res.map((r) => r.code));
}

async function getDuplicateDecks(decklists: Insertable<ArkhamdbDecklist>[]) {
  const weaknessCodes = await getWeaknessCodes();

  const decklistsByHash = new Map<string, number[]>();

  for (const decklist of decklists) {
    const slots = hashSlots(decklist.slots, weaknessCodes);
    const sideSlots = hashSlots(decklist.side_slots, weaknessCodes);
    const hash = `${decklist.canonical_investigator_code}-${slots}-${sideSlots}`;
    if (decklistsByHash.has(hash)) {
      // biome-ignore lint/style/noNonNullAssertion: checked above
      decklistsByHash.get(hash)!.push(decklist.id);
    } else {
      decklistsByHash.set(hash, [decklist.id]);
    }
  }

  const duplicates = Array.from(decklistsByHash.values()).reduce(
    (acc, curr) => {
      if (curr.length === 1) return acc;

      const duplicate_of = curr[0] as number;

      for (const id of curr.slice(1)) {
        acc.push({ duplicate_of, id });
      }

      return acc;
    },
    [] as Duplicate[],
  );

  return duplicates;
}

function hashSlots(
  slots: Record<string, number> | null | undefined,
  weaknessCodes: Set<string>,
): string {
  if (!slots) return "";
  const entries = Object.entries(slots)
    .filter(([key]) => !weaknessCodes.has(key))
    .sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}:${v}`).join(",");
}

function serialize(data: Record<string, unknown>[]): any[] {
  return data.map((row) => {
    const serializedRow: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
      if (typeof value === "object" && value !== null) {
        const s = JSON.stringify(value);
        serializedRow[key] = s;
      } else {
        serializedRow[key] = value;
      }
    }

    return serializedRow;
  });
}
