import sql from "../db/db.ts";
import { type Card, cardSchema } from "../db/schemas/card.schema.ts";
import { cycleSchema } from "../db/schemas/cycle.schema.ts";
import { dataVersionSchema } from "../db/schemas/data-version.schema.ts";
import { encounterSetSchema } from "../db/schemas/encounter-set.schema.ts";
import { factionSchema } from "../db/schemas/faction.schema.ts";
import { packSchema } from "../db/schemas/pack.schema.ts";
import { subtypeSchema } from "../db/schemas/subtype.schema.ts";
import { tabooSetSchema } from "../db/schemas/taboo-set.schema.ts";
import { typeSchema } from "../db/schemas/type.schema.ts";
import factionsSeed from "../db/seeds/factions.json" with { type: "json" };
import subtypesSeed from "../db/seeds/subtypes.json" with { type: "json" };
import typesSeed from "../db/seeds/types.json" with { type: "json" };
import { chunkArray } from "../lib/chunk-array.ts";
import config from "../lib/config.ts";
import { gql } from "../lib/gql.ts";

await ingest();

await sql.end();

async function ingest() {
  console.time("fetching-metadata");
  const { data } = await gql<QueryResponse>(config.DATA_API_URL, query());
  console.timeEnd("fetching-metadata");

  console.time("recreating-data");

  const cards = data.all_card.map((c) => cardSchema.parse(c));
  const cycles = data.cycle.map((c) => cycleSchema.parse(c));
  const dataVersion = data.all_card_updated.map((d) =>
    dataVersionSchema.parse(d),
  );
  const encounterSets = resolveEncounterSets(data.card_encounter_set, cards);
  const factions = factionsSeed.map((f) => factionSchema.parse(f));
  const packs = data.pack.map((p) => packSchema.parse(p));
  const subtypes = subtypesSeed.map((s) => subtypeSchema.parse(s));
  const tabooSets = data.taboo_set.map((t) => tabooSetSchema.parse(t));
  const types = typesSeed.map((t) => typeSchema.parse(t));

  await sql.begin(async (sql) => {
    await sql`delete from cards`;
    await sql`delete from factions`;
    await sql`delete from subtypes`;
    await sql`delete from types`;
    await sql`delete from data_versions`;
    await sql`delete from packs`;
    await sql`delete from cycles`;
    await sql`delete from encounter_sets`;
    await sql`delete from taboo_sets`;

    await sql`insert into factions ${sql(factions)}`;
    await sql`insert into subtypes ${sql(subtypes)}`;
    await sql`insert into types ${sql(types)}`;
    await sql`insert into data_versions ${sql(dataVersion)}`;
    await sql`insert into taboo_sets ${sql(tabooSets)}`;
    await sql`insert into cycles ${sql(cycles)}`;
    await sql`insert into packs ${sql(packs)}`;
    await sql`insert into encounter_sets ${sql(encounterSets)}`;

    for (const chunk of chunkArray(cards, 500)) {
      // biome-ignore lint/suspicious/noExplicitAny: Bad library typing.
      await sql`insert into cards ${sql(chunk as any[])}`;
    }
  });

  console.timeEnd("recreating-data");
}

type CardEncounterSet = {
  code: string;
  locale: string;
  name: string;
};

type QueryResponse = {
  all_card: {
    encounter_code?: string;
    pack_code: string;
  }[];
  all_card_updated: Record<string, unknown>[];
  card_encounter_set: CardEncounterSet[];
  pack: Record<string, unknown>[];
  cycle: Record<string, unknown>[];
  taboo_set: Record<string, unknown>[];
};

function query() {
  const locales = config.DATA_LOCALES.split(",").map((l) => l.trim());
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
          version: { _lte: ${config.DATA_VERSION} }
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
  cards: Card[],
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

      acc.push(
        encounterSetSchema.parse({
          code: en.code,
          real_name: en.name,
          pack_code,
          translations,
        }),
      );

      return acc;
    },
    [] as Record<string, unknown>[],
  );
}
