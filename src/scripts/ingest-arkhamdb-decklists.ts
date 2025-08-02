/** biome-ignore-all lint/suspicious/noExplicitAny: not relevant for script. */

import assert from "node:assert";
import { createReadStream, createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "@fast-csv/parse";
import type { Insertable, Transaction } from "kysely";
import { connectionString, getDatabase } from "../db/db.ts";
import type { ArkhamdbDecklist, DB } from "../db/schema.types.ts";
import { chunkArray } from "../lib/chunk-array.ts";
import { configFromEnv } from "../lib/config.ts";

const config = configFromEnv();
const db = getDatabase(connectionString(config));

await ingest();
await db.destroy();

async function ingest() {
  console.time("downloading-files");
  const [authorsFile, decklistsFile, statsFile] = await Promise.all([
    downloadCsvFile("authors"),
    downloadCsvFile("decklists"),
    downloadCsvFile("decklist_stats"),
  ]);
  console.timeEnd("downloading-files");

  const tempFiles = [authorsFile, decklistsFile, statsFile];

  const [stats, weaknessCodes] = await Promise.all([
    loadCsvIntoMemory<ApiStats>(statsFile),
    getWeaknessCodes(),
  ]);

  try {
    console.time("processing-data");

    await db.transaction().execute(async (tx) => {
      await tx.deleteFrom("arkhamdb_decklist_duplicate").execute();
      await tx.deleteFrom("arkhamdb_decklist").execute();
      await tx.deleteFrom("arkhamdb_user").execute();

      await streamCsvAndInsert(
        authorsFile,
        (row: ApiAuthor) => ({
          id: Number(row.id),
          name: row.name,
          reputation: Number(row.reputation),
        }),
        tx,
        "arkhamdb_user",
        10000,
      );

      const statsByDecklistId = new Map(
        stats.map((s) => [Number(s.decklist_id), Number(s.likes)]),
      );

      const decklistsByHash = new Map<
        string,
        { id: number; likeCount: number }[]
      >();

      await streamCsvAndInsert(
        decklistsFile,
        (deck: ApiDecklist) => {
          const meta = JSON.parse(deck.meta || "{}");
          const backCode = meta.alternate_back || deck.investigator_code;
          const frontCode = meta.alternate_front || deck.investigator_code;
          const slots = parseSlots(deck.slots) as Record<string, number>;
          const sideSlots = parseSlots(deck.sideSlots);
          const ignoreDeckLimitSlots = parseSlots(deck.ignoreDeckLimitSlots);
          const likeCount = statsByDecklistId.get(Number(deck.id)) ?? 0;
          const slotsHash = hashSlots(slots, weaknessCodes);
          const sideSlotsHash = hashSlots(sideSlots, weaknessCodes);
          const hash = `${deck.canonical_investigator_code}-${slotsHash}-${sideSlotsHash}`;

          delete (deck as any).sideSlots;
          delete (deck as any).ignoreDeckLimitSlots;

          const deckInfo = {
            id: deck.id,
            likeCount: likeCount,
          };

          if (decklistsByHash.has(hash)) {
            // biome-ignore lint/style/noNonNullAssertion: checked above
            decklistsByHash.get(hash)!.push(deckInfo);
          } else {
            decklistsByHash.set(hash, [deckInfo]);
          }

          const formatted: Insertable<ArkhamdbDecklist> = {
            ...deck,
            id: Number(deck.id),
            canonical_investigator_code: `${frontCode}-${backCode}`,
            user_id: Number(deck.user_id),
            meta,
            like_count: likeCount,
            slots,
            side_slots: sideSlots,
            ignore_deck_limit_slots: ignoreDeckLimitSlots,
            xp: deck.xp ? Number(deck.xp ?? 0) : null,
            xp_spent: deck.xp_spent ? Number(deck.xp_spent ?? 0) : null,
            xp_adjustment: deck.xp_adjustment
              ? Number(deck.xp_adjustment ?? 0)
              : null,
            taboo_id: deck.taboo_id ? Number(deck.taboo_id) : null,
            previous_deck: deck.previous_deck
              ? Number(deck.previous_deck)
              : null,
            next_deck: deck.next_deck ? Number(deck.next_deck) : null,
          };

          console.log(formatted);

          return formatted;
        },
        tx,
        "arkhamdb_decklist",
        2500,
      );

      const duplicates = Array.from(decklistsByHash.values()).reduce(
        (acc, curr) => {
          if (curr.length === 1) return acc;

          const sorted = curr.sort((a, b) => b.likeCount - a.likeCount);

          const original = sorted[0];

          for (const dupe of curr.slice(1)) {
            // biome-ignore lint/style/noNonNullAssertion: length checked above
            acc.push({ duplicate_of: original!.id, id: dupe.id });
          }

          return acc;
        },
        [] as Duplicate[],
      );

      // Insert duplicates in chunks
      for (const chunk of chunkArray(duplicates, 25000)) {
        await tx
          .insertInto("arkhamdb_decklist_duplicate")
          .values(chunk)
          .execute();
      }
    });

    console.timeEnd("processing-data");
  } finally {
    await Promise.all(tempFiles.map((f) => unlink(f).catch(console.error)));
  }
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
  id: number;
  name: string;
  date_creation: string;
  date_update: string | null;
  description_md: string | null;
  user_id: string;
  investigator_code: string;
  investigator_name: string;
  slots: string;
  sideSlots: string | null;
  ignoreDeckLimitSlots: string | null;
  xp: number | null;
  xp_spent: number | null;
  xp_adjustment: number | null;
  exile_string: string | null;
  taboo_id: number | null;
  meta: string;
  tags: string | null;
  previous_deck: number | null;
  next_deck: number | null;
  canonical_investigator_code: string;
};

async function downloadCsvFile(name: string): Promise<string> {
  const res = await fetch(
    `${config.INGEST_URL_ARKHAMDB_DECKLISTS}/${name}.csv`,
  );

  if (!res.ok) throw new Error(`Failed to fetch ${name}: ${res.statusText}`);

  const tempFilePath = join(tmpdir(), `${name}-${Date.now()}.csv`);
  const writeStream = createWriteStream(tempFilePath);

  await new Promise((resolve, reject) => {
    assert(res.body, `Response body is null for ${name}`);

    res.body.pipeTo(
      new WritableStream({
        write(chunk) {
          writeStream.write(chunk);
        },
        close() {
          writeStream.end();
          resolve(undefined);
        },
        abort(error) {
          writeStream.destroy();
          reject(error);
        },
      }),
    );
  });

  return tempFilePath;
}

async function streamCsvAndInsert<T, U>(
  filePath: string,
  transform: (row: T) => U,
  tx: Transaction<DB>,
  tableName: string,
  batchSize: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const batch: U[] = [];

    createReadStream(filePath)
      .pipe(parse({ headers: true }))
      .on("data", async (row: T) => {
        const transformed = transform(row);
        batch.push(transformed);

        if (batch.length >= batchSize) {
          try {
            await tx
              .insertInto(tableName as keyof DB)
              .values(batch.splice(0, batchSize))
              .execute();
          } catch (error) {
            reject(error);
            return;
          }
        }
      })
      .on("end", async () => {
        try {
          if (batch.length > 0) {
            await tx
              .insertInto(tableName as keyof DB)
              .values(batch)
              .execute();
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject);
  });
}

async function loadCsvIntoMemory<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    createReadStream(filePath)
      .pipe(parse({ headers: true }))
      .on("data", (row: T) => {
        results.push(row);
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
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
