import sql from "../db/db.ts";
import factions from "../db/seeds/factions.json" with { type: "json" };
import subtypes from "../db/seeds/subtypes.json" with { type: "json" };
import types from "../db/seeds/types.json" with { type: "json" };
import config from "../lib/config.ts";
import { gql } from "../lib/gql.ts";

await ingest();

await sql.end();

async function ingest() {
  console.time("querying-graphql-api");
  const { data } = await gql<QueryResponse>(config.DATA_API_URL, query());
  console.timeEnd("querying-graphql-api");

  console.time("recreating-data");

  const {
    all_card: cards,
    all_card_updated: data_versions,
    card_encounter_set,
    cycle,
    pack,
    taboo_set,
  } = data;

  const encounterSets = resolveEncounterSets(card_encounter_set, cards);

  await sql.begin(async (sql) => {
    await sql`delete from factions`;
    await sql`delete from subtypes`;
    await sql`delete from types`;
    await sql`delete from data_versions`;
    await sql`delete from cycles`;
    await sql`delete from packs`;
    await sql`delete from encounter_sets`;
    await sql`delete from taboo_sets`;
    await sql`delete from cards`;

    await sql`insert into factions ${sql(factions)}`;
    await sql`insert into subtypes ${sql(subtypes)}`;
    await sql`insert into types ${sql(types)}`;
    await sql`insert into data_versions ${sql(data_versions)}`;
    await sql`insert into taboo_sets ${sql(taboo_set)}`;
    await sql`insert into cycles ${sql(cycle)}`;
    await sql`insert into packs ${sql(pack)}`;
    await sql`insert into encounter_sets ${sql(encounterSets)}`;

    for (const chunk of chunkArray(cards, 100)) {
      await sql`insert into cards ${sql(chunk)}`;
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
          version: { _lte: ${config.DATA_VERSION} },
          _or: [
            { taboo_set_id: { _neq: 0 } },
            { taboo_set_id: { _is_null: true } }
          ]
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

      taboo_set(where: { active: { _eq: true } }) {
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
  cards: QueryResponse["all_card"],
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

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
