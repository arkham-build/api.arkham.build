import sql from "../db/db.ts";
import {
  type ArkhamDBDecklist,
  arkhamDBDecklistSchema,
} from "../db/schemas/arkhamdb-decklist.schema.ts";
import { arkhamDBUserSchema } from "../db/schemas/arkhamdb-user.schema.ts";
import { chunkArray } from "../lib/chunk-array.ts";

await ingest();
await sql.end();

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

  const users = authors.map((a) => arkhamDBUserSchema.parse(a));

  const decklists = rawDecklists.map((_deck) => {
    const meta = JSON.parse(_deck.meta || "{}");
    const backCode = meta.alternate_back || _deck.investigator_code;
    const frontCode = meta.alternate_front || _deck.investigator_code;

    const deck = _deck as unknown as ArkhamDBDecklist;
    deck.meta = meta;
    deck.like_count = statsByDecklistId.get(deck.id)?.likes ?? 0;
    deck.canonical_investigator_code = `${frontCode}-${backCode}`;
    deck.slots = parseSlots(_deck.slots) as Record<string, number>;
    deck.side_slots = parseSlots(_deck.sideSlots);
    deck.ignore_deck_limit_slots = parseSlots(_deck.ignoreDeckLimitSlots);
    return arkhamDBDecklistSchema.parse(deck);
  });

  await sql.begin(async (sql) => {
    await sql`delete from arkhamdb_decklists`;
    await sql`delete from arkhamdb_users`;

    for (const chunk of chunkArray(users, 10000)) {
      await sql`insert into arkhamdb_users ${sql(chunk)}`;
    }

    for (const chunk of chunkArray(decklists, 2500)) {
      // biome-ignore lint/suspicious/noExplicitAny: bad library typing
      await sql`insert into arkhamdb_decklists ${sql(chunk as any[])}`;
    }
  });

  console.timeEnd("recreating-data");
}

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
    `https://arkhamdb-decklists-mirror.arkham.build/${name}.json`,
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
