/** biome-ignore-all lint/suspicious/noExplicitAny: not relevant for script */

import { applySqlFiles } from "../db/db.helpers.ts";
import { connectionString, type Database, getDatabase } from "../db/db.ts";
import { chunkArray } from "../lib/chunk-array.ts";
import { type Config, configFromEnv } from "../lib/config.ts";
import { gql } from "../lib/gql.ts";
import { log } from "../lib/logger.ts";

try {
  const config = configFromEnv();
  const db = getDatabase(connectionString(config));
  await ingest(config, db);
  await db.destroy();
} catch (err) {
  log("error", "Failed to ingest metadata", {
    error: (err as Error).message,
  });

  process.exit(1);
}

async function ingest(config: Config, db: Database) {
  const downloadStartedAt = Date.now();
  const { data } = await gql<QueryResponse>(
    config.INGEST_URL_METADATA,
    query(config),
  );

  log("info", "Downloaded metadata", {
    duration_ms: Date.now() - downloadStartedAt,
  });

  const processStartedAt = Date.now();

  await db.transaction().execute(async (tx) => {
    await tx.deleteFrom("card_resolution").execute();
    await tx.deleteFrom("card").execute();
    await tx.deleteFrom("faction").execute();
    await tx.deleteFrom("subtype").execute();
    await tx.deleteFrom("type").execute();
    await tx.deleteFrom("data_version").execute();
    await tx.deleteFrom("encounter_set").execute();
    await tx.deleteFrom("pack").execute();
    await tx.deleteFrom("cycle").execute();
    await tx.deleteFrom("taboo_set").execute();

    await applySqlFiles(tx, "../db/seeds");

    await tx
      .insertInto("data_version")
      .values(data.all_card_updated as any[])
      .execute();

    await tx
      .insertInto("taboo_set")
      .values(data.taboo_set as any[])
      .execute();

    await tx.insertInto("cycle").values(serialize(data.cycle)).execute();
    await tx.insertInto("pack").values(serialize(data.pack)).execute();

    await tx
      .insertInto("encounter_set")
      .values(
        serialize(resolveEncounterSets(data.card_encounter_set, data.all_card)),
      )
      .execute();

    for (const chunk of chunkArray(data.all_card, 500)) {
      await tx.insertInto("card").values(serialize(chunk)).execute();
    }

    const cardResolutions = data.all_card.reduce(
      (acc, c) => {
        // parallel investigators and replacements are not cleanly marked, work around
        if (
          (c.duplicate_of_code || c.alt_art_investigator) &&
          !c.code.startsWith("900") &&
          !c.code.startsWith("910")
        ) {
          acc.push({
            id: c.code,
            resolves_to:
              (c.duplicate_of_code as string) ||
              (c.alternate_of_code as string) ||
              (data.all_card.find(
                (cc) =>
                  cc.real_name === c.real_name && !cc.alt_art_investigator,
              )?.code as string),
          });
        }
        return acc;
      },
      [] as { id: string; resolves_to: string }[],
    );

    for (const chunk of chunkArray(cardResolutions, 30000)) {
      await tx
        .insertInto("card_resolution")
        .onConflict((oc) => oc.doNothing())
        .values(chunk)
        .execute();
    }
  });

  log("info", "Imported metadata", {
    duration_ms: Date.now() - processStartedAt,
  });
}

type CardEncounterSet = {
  code: string;
  locale: string;
  name: string;
};

type QueryResponse = {
  all_card: {
    code: string;
    encounter_code?: string;
    pack_code: string;
    alternate_of_code?: string;
    duplicate_of_code?: string;
    alt_art_investigator?: boolean;
    real_name: string;
  }[];
  all_card_updated: Record<string, unknown>[];
  card_encounter_set: CardEncounterSet[];
  pack: Record<string, unknown>[];
  cycle: Record<string, unknown>[];
  taboo_set: Record<string, unknown>[];
};

function query(config: Config) {
  const locales = config.METADATA_LOCALES.split(",").map((l) => l.trim());
  const translationLocales = locales.filter((l) => l !== "en");

  const localesStr = JSON.stringify(locales);
  const translationLocalesStr = JSON.stringify(translationLocales);

  return `
    {
      all_card(
        where: {
          official: { _eq: true },
          taboo_placeholder: { _is_null: true },
          pack_code: { _neq: "zbh_00008" },
          version: { _lte: ${config.METADATA_VERSION} }
        }
      ) {
        alt_art_investigator
        alternate_of_code
        back_illustrator
        back_link_id
        clues
        clues_fixed
        code
        cost
        customization_options
        deck_limit
        deck_options
        deck_requirements
        doom
        double_sided
        duplicate_of_code
        encounter_code
        encounter_position
        enemy_damage
        enemy_evade
        enemy_fight
        enemy_horror
        errata_date
        exceptional
        exile
        faction_code
        faction2_code
        faction3_code
        heals_damage
        heals_horror
        health
        health_per_investigator
        hidden
        id # used for taboos
        illustrator
        is_unique
        linked
        myriad
        official
        pack_code
        pack_position
        permanent
        position
        preview
        quantity
        real_back_flavor
        real_back_name
        real_back_text
        real_back_traits
        real_customization_change
        real_customization_text
        real_flavor
        real_name
        real_slot
        real_subname
        real_taboo_text_change
        real_text
        real_traits
        restrictions
        sanity
        shroud
        side_deck_options
        side_deck_requirements
        skill_agility
        skill_combat
        skill_intellect
        skill_willpower
        skill_wild
        stage
        subtype_code
        taboo_set_id
        taboo_xp
        tags
        type_code
        vengeance
        victory
        xp
        translations(where: { locale: { _in: ${JSON.stringify(translationLocales)} } }) {
          text
          back_flavor
          back_name
          back_text
          back_traits
          flavor
          locale
          name
          customization_change
          customization_text
          subname
          traits
          updated_at
        }
      }

      all_card_updated(where: { locale: { _in: ${localesStr} } }) {
        card_count
        cards_updated_at
        locale
        translation_updated_at
      }

      card_encounter_set(
        where: {
          official: { _eq: true },
          locale: {  _in: ${localesStr} }
        }
      ) {
        code
        locale
        name
      }

      cycle(where: { official: { _eq: true } }) {
        code
        position
        real_name
        translations(where: { locale: { _in: ${translationLocalesStr} } }) {
          locale
          name
        }
      }

      pack(where: {official: { _eq: true }, code: { _neq: "books" }}) {
        code
        cycle_code
        position
        real_name
        translations(where: { locale: { _in: ${translationLocalesStr} } }) {
          locale
          name
        }
      }

      taboo_set {
        name
        card_count
        id
        date
      }
    }
  `;
}

function resolveEncounterSets(
  card_encounter_set: QueryResponse["card_encounter_set"],
  cards: { encounter_code?: string; pack_code: string }[],
) {
  const encounterSetsMap = card_encounter_set.reduce(
    (acc, curr) => {
      acc[curr.code] ??= {};
      // biome-ignore lint/style/noNonNullAssertion: SAFE
      acc[curr.code]![curr.locale] = curr;
      return acc;
    },
    {} as Record<string, Record<string, CardEncounterSet>>,
  );

  const packCodeMapping = cards.reduce(
    (acc, curr) => {
      if (curr.encounter_code) {
        acc[curr.encounter_code] = curr.pack_code;
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  return Object.values(encounterSetsMap).reduce(
    (acc, localized) => {
      const { en, ...rest } = localized;
      if (!en) return acc;

      const pack_code = packCodeMapping[en.code];
      if (!pack_code) return acc;

      const translations = Object.values(rest).map((set) => ({
        name: set.name,
        locale: set.locale,
      }));

      acc.push({
        code: en.code,
        real_name: en.name,
        pack_code,
        translations,
      });

      return acc;
    },
    [] as Record<string, unknown>[],
  );
}

function serialize(data: Record<string, unknown>[]): any[] {
  return data.map((row) => {
    const serializedRow: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
      if (typeof value === "object" && value !== null) {
        const s = JSON.stringify(value);
        serializedRow[key] = s;
      } else {
        serializedRow[key] = value || null;
      }
    }

    return serializedRow;
  });
}
