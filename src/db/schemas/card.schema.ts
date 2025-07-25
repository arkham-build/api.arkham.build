import { z } from "zod";

/* Customizations */

const CustomizationChoice = z.enum([
  "choose_card",
  "choose_trait",
  "remove_slot",
  "choose_skill",
]);

const customizationTextChange = z.enum([
  "append",
  "insert",
  "replace",
  "trait",
]);

const customizationOptionSchema = z.object({
  card: z
    .object({
      type: z.nullish(z.array(z.string())),
      trait: z.nullish(z.array(z.string())),
    })
    .nullish(),
  choice: CustomizationChoice.nullish(),
  cost: z.number().nullish(),
  deck_limit: z.number().nullish(),
  health: z.number().nullish(),
  position: z.number().nullish(),
  quantity: z.number().nullish(),
  real_slot: z.string().nullish(),
  real_text: z.string().nullish(),
  real_traits: z.string().nullish(),
  sanity: z.number().nullish(),
  tags: z.array(z.string()).nullish(),
  text_change: customizationTextChange.nullish(),
  xp: z.number(),
});

export type CustomizationOption = z.infer<typeof customizationOptionSchema>;

/* Deck Options */

const AtLeastSchema = z.object({
  factions: z.number().nullish(),
  min: z.number(),
  types: z.number().nullish(),
});

const OptionSelectSchema = z.object({
  id: z.string(),
  level: z.object({
    min: z.number(),
    max: z.number(),
  }),
  name: z.string(),
  size: z.number().nullish(),
  trait: z.array(z.string().nullish()),
  type: z.array(z.string()).nullish(),
});

export type OptionSelect = z.infer<typeof OptionSelectSchema>;

const deckOptionSchema = z.object({
  atleast: AtLeastSchema.nullish(),
  base_level: z.object({ min: z.number(), max: z.number() }).nullish(),
  deck_size_select: z.union([z.string(), z.array(z.string())]).nullish(),
  error: z.string().nullish(),
  faction_select: z.array(z.string()).nullish(),
  faction: z.array(z.string()).nullish(),
  id: z.string().nullish(),
  level: z.object({ min: z.number(), max: z.number() }).nullish(),
  limit: z.number().nullish(),
  name: z.string().nullish(),
  not: z.boolean().nullish(),
  option_select: z.array(OptionSelectSchema).nullish(),
  permanent: z.boolean().nullish(),
  slot: z.array(z.string()).nullish(),
  tag: z.nullish(z.array(z.string())),
  text_exact: z.array(z.string()).nullish(),
  text: z.array(z.string()).nullish(),
  trait: z.array(z.string()).nullish(),
  type: z.array(z.string()).nullish(),
  uses: z.array(z.string()).nullish(),
  virtual: z.boolean().nullish(),
});

export type DeckOption = z.infer<typeof deckOptionSchema>;

export type DeckOptionSelectType = "deckSize" | "faction" | "option";

const deckRequirementsSchema = z.object({
  card: z.record(z.string(), z.record(z.string(), z.string())),
  random: z
    .array(z.object({ value: z.string(), target: z.string() }))
    .nullish(),
  size: z.number(),
});

const restrictionsSchema = z.object({
  investigator: z.nullish(z.record(z.string(), z.string())),
  trait: z.nullish(z.array(z.string())),
});

export const cardSchema = z.object({
  alt_art_investigator: z.boolean().default(false).nullish(),
  alternate_of_code: z.string().max(36).nullish(),
  back_illustrator: z.string().max(255).nullish(),
  back_link_id: z.string().max(36).nullish(),
  clues_fixed: z.boolean().default(false).nullish(),
  clues: z.number().nullish(),
  code: z.string().max(36),
  cost: z.number().nullish(),
  customization_options: z.array(customizationOptionSchema).nullish(),
  deck_limit: z.number().nullish(),
  deck_options: z.array(deckOptionSchema).nullish(),
  deck_requirements: deckRequirementsSchema.nullish(),
  doom: z.number().nullish(),
  double_sided: z.boolean().default(false).nullish(),
  duplicate_of_code: z.string().max(36).nullish(),
  encounter_code: z.string().max(255).nullish(),
  encounter_position: z.number().nullish(),
  enemy_damage: z.number().nullish(),
  enemy_evade: z.number().nullish(),
  enemy_fight: z.number().nullish(),
  enemy_horror: z.number().nullish(),
  errata_date: z.string().nullish(),
  exceptional: z.boolean().default(false).nullish(),
  exile: z.boolean().default(false).nullish(),
  faction_code: z.string().max(36),
  faction2_code: z.string().max(36).nullish(),
  faction3_code: z.string().max(36).nullish(),
  heals_damage: z.boolean().default(false).nullish(),
  heals_horror: z.boolean().default(false).nullish(),
  health_per_investigator: z.boolean().default(false).nullish(),
  health: z.number().nullish(),
  hidden: z.boolean().default(false).nullish(),
  id: z.string().max(40),
  illustrator: z.string().max(255).nullish(),
  is_unique: z.boolean().default(false).nullish(),
  linked: z.boolean().default(false).nullish(),
  myriad: z.boolean().default(false).nullish(),
  official: z.boolean().default(true),
  pack_code: z.string().max(36),
  pack_position: z.number().nullish(),
  permanent: z.boolean().default(false).nullish(),
  position: z.number(),
  preview: z.boolean().default(false).nullish(),
  quantity: z.number(),
  real_back_flavor: z.string().nullish(),
  real_back_name: z.string().max(255).nullish(),
  real_back_text: z.string().nullish(),
  real_back_traits: z.string().max(255).nullish(),
  real_customization_change: z.string().nullish(),
  real_customization_text: z.string().nullish(),
  real_flavor: z.string().nullish(),
  real_name: z.string().max(255),
  real_slot: z.string().max(36).nullish(),
  real_subname: z.string().max(255).nullish(),
  real_taboo_text_change: z.string().nullish(),
  real_text: z.string().nullish(),
  real_traits: z.string().max(255).nullish(),
  restrictions: restrictionsSchema.nullish(),
  sanity: z.number().nullish(),
  shroud: z.number().nullish(),
  side_deck_options: z.array(deckOptionSchema).nullish(),
  side_deck_requirements: deckRequirementsSchema.nullish(),
  skill_agility: z.number().nullish(),
  skill_combat: z.number().nullish(),
  skill_intellect: z.number().nullish(),
  skill_wild: z.number().nullish(),
  skill_willpower: z.number().nullish(),
  stage: z.number().nullish(),
  subtype_code: z.string().max(36).nullish(),
  taboo_set_id: z.number().nullish(),
  taboo_xp: z.number().nullish(),
  tags: z.preprocess((val) => {
    if (typeof val === "string") return val.split(",");
    return val;
  }, z.array(z.string()).nullish()),
  translations: z.array(
    z.object({
      back_flavor: z.string().nullish(),
      back_name: z.string().max(255).nullish(),
      back_text: z.string().nullish(),
      back_traits: z.string().max(255).nullish(),
      customization_change: z.string().nullish(),
      customization_text: z.string().nullish(),
      flavor: z.string().nullish(),
      name: z.string().max(255),
      slot: z.string().max(36).nullish(),
      subname: z.string().max(255).nullish(),
      taboo_text_change: z.string().nullish(),
      text: z.string().nullish(),
      traits: z.string().max(255).nullish(),
    }),
  ),
  type_code: z.string().max(36),
  vengeance: z.number().nullish(),
  victory: z.number().nullish(),
  xp: z.number().nullish(),
});

export type Card = z.infer<typeof cardSchema>;
